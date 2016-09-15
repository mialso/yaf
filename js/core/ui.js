;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;

	// define static data
	var module_data = [
		"ui",
		["log", "ui_element", "ui_container", "task"],
		UI,
		test
	];

	// templates related data
	var ui_path = "ui/";
	var ui_ext = ".html";
	var template_names = [];
	var template_storage = [];

	var dom_queue = {};
	var containers = {};
	var ui = {};
	var el_queue= {};
	var template_queue = {};
	var message = ["ui", ""];
	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("ui");
	core.core_loader.module = module_data;

	// create module resources

	// module constructor
	function UI() {
		this.name = "ui";
		this.global_id = "ui>model";
/*
		Object.defineProperty(this, "ready", {
			set: model_ready,
			get: function() {return null;}
		});
*/

		this.update = core.task.create(["update", update_element]);
		this.model = core.task.create(["model", set_model]);

		this.add_element = core.task.create(["add_element", add_element]);
		this.container = core.task.create(["container", add_container]);
		this.in_dom = core.task.create(["in_dom", elem_dom_added]);
		this.dom_queue = core.task.create(["dom_queue", push_to_dom_queue]);
		this.clean_up = clean_up;
		this.ui = ui;
		this.Container = app.core.ui_container.Container;
		delete core.ui_container;
		this.get_t = function() {
			for (var i=0; i < template_names.length; ++i) {
				console.log(i+">"+template_names[i]+"\n"+template_storage[i]+"\n\n");
			}
		}
	}
	/*
	 * TODO: possibly move to element state
	 * purpose: perform actions when element is added to DOM
	 */
	function elem_dom_added(elem) {
		var func = "elem_dom_added(): ";
		for (var i = 0; i < elem.containers.length; ++i) {
			var cont_name = elem.containers[i];
			if (!containers[cont_name]) {
				this.task.error(func+"container \""+cont_name+"\" is not initialized while element is already dom added");
				return;
			}
			this.task.run_async("object", containers[cont_name], "parent_ready", true);
		}
	}

	/*
	 * TODO: is this used anyhow anywhere???
	 */
	function push_to_dom_queue(elem) {
		var func = "push_to_dom_queue(): ";
		dom_queue.push(elem);
	}

	function update_element([cont_name, elem]) {
		var func = "update_element(): ";
		if (undefined === containers[cont_name]) {
			this.task.error(func+"contaner \""+cont_name+"\" is ="+containers[cont_name]+";");
			return;
		}
		if (0 === containers[cont_name].elems.length) {
			this.task.error(func+"container \""+cont_name+"\" <elems> length = 0;");
			return;
		}
		var ind = containers[cont_name].elems.indexOf(elem.name);
		if (-1 === ind) {
			// TODO possible warn
			this.task.error(func+" element \""+elem.name+"\" is not found in container.elems;");
			return;
		}
		this.task.run_async("object", containers[cont_name], "update", [ind, elem]);
	}
	/*
	 * purpose: to add element to container
	 */
	function add_element(elem) {
		var func = "add_element(): ";
		var cont_name = elem.parnt;
		if (!cont_name || !elem) {
			this.task.error(func+"cont_name ="+cont_name+", elem ="+JSON.stringify(elem)+";");
			return;
		}
		// detect new container to be added and move elements from queue to it
		for (var i = 0; i < elem.containers.length; ++i) {
			var new_cont = elem.containers[i];
			this.task.debug(func+"container \""+new_cont.name+"\" added");
			if (undefined !== el_queue[new_cont]) {
				while(0 < el_queue[new_cont].length) {
					this.task.debug(func+"element \""+el_queue[new_cont][0].name+" inserted to container \""+new_cont+"\"");
					this.task.run_async("object", containers[new_cont], "insert", el_queue[new_cont].shift());
				}
			}
		}
		// if contaier is not loaded yet, put element to queue
		if (!containers[cont_name]) {
			if (undefined === el_queue[cont_name]) {
				this.task.debug(func+"new el_queue ="+cont_name);
				el_queue[cont_name] = [];
			}
			this.task.debug(func+"element \""+elem.name+"\" in el_queue ="+cont_name);
			el_queue[cont_name].push(elem);
		} else {
			this.task.run_async("object", containers[cont_name], "insert", elem);
		}
	}
	/*
	 * purpose:
	 */
	function add_container([name, type, children]) {
		var func = "add_container(): ";
		containers[name] = new this.Container(name, type, children);
		if ("body" === name) {
			containers[name].parent_ready = true;
		}
		this.task.debug(func+"container \""+name+"\" added;");
	}
	/*
	 * purpose:
	 */
	function model_ready([model, name]) {
		var func = "model_ready(): ";
		if ("body" === model) {
			this.task.debug(func+"model = body, return");
			return;
		}
		this.task.run_sync("model", model, "ui_ready", name);
	}
	/*
	 * purpose: to clean_up all data stored, except templates
	 */
	function clean_up() {
		containers = {};
		ui = {};
		this.ui = ui;
		el_queue= {};
		glob.document.body.innerHTML = "";
	}
	/*
	 * purpose:
	 */
	function set_model([model_data, ui_names]) {
		var func = "set_model(): ";
		var m_arr = model_data.split(">");
		var model = m_arr.shift();

		// invalid ui_model, exit
		if (undefined === ui_names || 0 === ui_names.length) {
			this.task.error(func+"invalid ui_model");
			return;
		}

		// create elements
		for (var i =0; i < ui_names.length; ++i) {
			// load ui model templates
			var el_id = model_data.split(">").shift()+"_"+ui_names[i];
			var el_name = ui_names[i];
			var el_path = ui_path+model+"/"+el_name+ui_ext;
			var el_ind = template_names.indexOf(el_id);
			if (-1 === el_ind) {
				// early exit if template was already requested
				if (template_queue.hasOwnProperty(el_id)) {
					template_queue[el_id].push([model_data, el_name]);
					this.task.debug(func+"element \""+el_id+"\" in template_queue");
					continue;
				}
				template_queue[el_id] = [];
				this.task.debug(func+"element \""+el_id+"\" template requested");
				this.task.run_async("core", "net", "req_get", [el_path, get_template_handler(model_data, el_name).bind(this)]);
				continue;
			}
			if (!template_storage[el_ind]) {
				this.task.error(func+"template storage for element \""+el_id+"\" is empty;");
				return;
			}
			var el_data = template_storage[el_ind];
			this.task.debug(func+"new model <"+model+"> element \""+el_id);
			this.task.run_async("core", "ui_element", "create", [model_data, el_name, el_data]);
		}
	}
	function get_template_handler(model_data, el_name) {
		return function(data) {
			var func = "template_handler(): ";
			var el_id = model_data.split(">").shift()+"_"+el_name;
			var ind = template_storage.push(data) -1;
			if (0 > ind) {
				this.task.error(func+" template_storage index is "+ind+";");
				return;
			}
			template_names[ind] = el_id;

			this.task.run_sync("core", "ui_element", "create", [model_data, el_name, data]);

			if (template_queue[el_id] && 0 < template_queue[el_id].length) {
				for (var i = 0; i < template_queue[el_id].length; ++i) {
					this.task.run_sync("core", "ui_element", "create", [template_queue[el_id][i][0], template_queue[el_id][i][1], data]);
				}
			}
		}
	}
	function test() {
		return 255;
	}
})(window);
