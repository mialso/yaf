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
		Object.defineProperty(this, "ready", {
			set: model_ready,
			get: function() {return null;}
		});

		this.update = core.task.create(["update", update_element]);
		this.model = core.task.create(["model", set_model]);

		Object.defineProperty(this, "element", {
			set: add_element,
			get: function() {return true;}
		});
		this.container = core.task.create(["container", add_container]);
/*
		Object.defineProperty(this, "container", {
			set: add_container.bind(this),
			get: function() {return true;}
		});
*/
		this.in_dom = core.task.create(["in_dom", elem_dom_added]);
/*
		Object.defineProperty(this, "in_dom", {
			set: elem_dom_added.bind(this),
			get: function() {return true;}
		});
*/
		Object.defineProperty(this, "dom_queue", {
			set: push_to_dom_queue,
			get: function() {return dom_queue;}
		});
		this.clean_up = clean_up;
		this.ui = ui;
/*
		this.Element = app.core.ui_element.Element;
		delete core.ui_element;
*/

		this.Container = app.core.ui_container.Container;
		delete core.ui_container;
		this.get_t = function() {
			for (var i=0; i < template_names.length; ++i) {
				console.log(i+">"+template_names[i]+"\n"+template_storage[i]+"\n\n");
			}
		}
	}
	/*
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
			containers[cont_name].parent_ready = true;
		}
	}
	function push_to_dom_queue(elem) {
		var func = "push_to_dom_queue(): ";
		log.info = func+"elem \""+elem.name+"\" added to dom queue as ["+dom_queue.length+"];";
		dom_queue.push(elem);
	}
	function update_element([cont_name, elem]) {
		var func = "update_element(): ";
		log.info = func+"contaner \""+cont_name+", elem ="+JSON.stringify(elem)+";";
		if (undefined === containers[cont_name]) {
			log.error = func+"contaner \""+cont_name+"\" is ="+containers[cont_name]+";";
			return;
		}
		if (0 === containers[cont_name].elems.length) {
			log.error = func+"container \""+cont_name+"\" <elems> length = 0;";
			return;
		}
		var ind = containers[cont_name].elems.indexOf(elem.name);
		if (-1 === ind) {
			// TODO possible warn
			log.error = func+" element \""+elem.name+"\" is not founc in container.elems;";
			return;
		}
		containers[cont_name].update(ind, elem);
	}
	function add_element([cont_name, elem]) {
		var func = "add_element(): ";
		if (!cont_name || !elem) {
			log.error = func+"cont_name ="+cont_name+", elem ="+JSON.stringify(elem)+";";
			return;
		}
		log.info = func+"cont_name ="+cont_name+", element ="+JSON.stringify(elem);
		//var check_container = [];
		if (0 < elem.containers.length) {
			elem.containers.forEach(function(cont_name) {
				//log.info = func+"container \""+cont.name+"\" added";
				log.info = func+"container \""+cont_name+"\" added";
/*
				//containers[cont.name] = cont;
				if ("body" === cont_name) {
					cont.parent_ready = true;
				}
*/
				if (undefined !== el_queue[cont_name]) {
					while(0 < el_queue[cont_name].length) {
						log.info = func+"element \""+el_queue[cont_name][0].name+" inserted to container \""+cont_name+"\"";
						containers[cont_name].insert(el_queue[cont_name].shift());
					}
				}
			});
		}
		if (!containers[cont_name]) {
			if (undefined === el_queue[cont_name]) {
				log.info = func+"new el_queue ="+cont_name;
				el_queue[cont_name] = [];
			}
			log.info = func+"element \""+elem.name+"\" in el_queue ="+cont_name;
			el_queue[cont_name].push(elem);
		} else {
			containers[cont_name].insert(elem);
		}
	}
	function add_container([name, type, children]) {
		var func = "add_container(): ";
		//console.log(func+"container \""+name+"\" <"+type+"> ["+children+"] added;");
		containers[name] = new this.Container(name, type, children);
		if ("body" === name) {
			//console.log("container \""+name+"\" parent_ready, type ="+type+"; children ="+children.toString()+"];");
			containers[name].parent_ready = true;
		}
		log.info = func+"container \""+name+"\" added;";
	}
	function model_ready([model, name]) {
		var func = "model_ready(): ";
		log.info = func+"model ="+model+", name ="+name;
		if ("body" === model) {
			log.info = func+"model = body, return";
			return;
		}
		core.model_data = message.concat([model, "ui_ready", name]);
	}
	function clean_up() {
		containers = {};
		ui = {};
		this.ui = ui;
		el_queue= {};
		glob.document.body.innerHTML = "";
	}
	function set_model([model_data, ui_names]) {
		var func = "set_model(): ";
		log.info = func+"model data ="+model_data+", ui_names ="+JSON.stringify(ui_names);
		//console.log(func+"model data ="+model_data+", ui_names ="+JSON.stringify(ui_names));
		var m_arr = model_data.split(">");
		var model = m_arr.shift();

		// invalid ui_model, exit
		if (undefined === ui_names || 0 === ui_names.length) {
			log.error = func+"invalid ui_model";
			return;
		}

		// clean up TODO only on login ???? or create single top container

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
					log.info = func+"element \""+el_id+"\" in template_queue";
					//console.log(func+"element \""+el_id+"\" in template_queue");
					continue;
				}
				template_queue[el_id] = [];
				log.info = func+"element \""+el_id+"\" template requested";
				//console.log(func+"element \""+el_id+"\" template requested");
/*
				core.message = message.concat(["net", "req_get", [el_path, get_template_handler(model_data, el_name).bind(this)]]);
*/
				this.task.run_async("core", "net", "req_get", [el_path, get_template_handler(model_data, el_name).bind(this)]);
				continue;
			}
			if (!template_storage[el_ind]) {
				log.error = func+"template storage for element \""+el_id+"\" is empty;";
				continue;
			}
			var el_data = template_storage[el_ind];
			log.info = func+"new model <"+model+"> element \""+el_id;
/*
			new core.ui.Element(model_data, el_name, el_data);
*/
			this.task.run_async("core", "ui_element", "create", [model_data, el_name, el_data]);
		}
	}
	function get_template_handler(model_data, el_name) {
		return function(data) {
			var func = "template_handler(): ";
			var el_id = model_data.split(">").shift()+"_"+el_name;
			var ind = template_storage.push(data) -1;
			if (0 > ind) {
				log.error = func+" template_storage index is "+ind+";";
				return;
			}
			template_names[ind] = el_id;
/*
			new core.ui.Element(model_data, el_name, data);
*/
			this.task.run_sync("core", "ui_element", "create", [model_data, el_name, data]);
			if (template_queue[el_id] && 0 < template_queue[el_id].length) {
				for (var i = 0; i < template_queue[el_id].length; ++i) {
/*
					new core.ui.Element(template_queue[el_id][i][0], template_queue[el_id][i][1], data);
*/
					this.task.run_sync("core", "ui_element", "create", [template_queue[el_id][i][0], template_queue[el_id][i][1], data]);
				}
			}
		}
	}
	function test() {
		return 255;
	}
})(window);
