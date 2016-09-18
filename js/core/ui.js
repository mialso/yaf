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
	var template_queue = {};
	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("ui");
	core.core_loader.module = module_data;

	// create module resources

	// module constructor
	function UI() {
		this.name = "ui";
		this.global_id = "ui>model";

		//this.update = core.task.create(["update", update_element]);
		this.model = core.task.create(["model", set_model]);

		//this.in_dom = core.task.create(["in_dom", elem_dom_added]);
		//this.dom_queue = core.task.create(["dom_queue", push_to_dom_queue]);
		this.clean_up = core.task.create(["clean_up", clean_up]);
		//this.ui = ui;

		this.get_t = function() {
			for (var i=0; i < template_names.length; ++i) {
				console.log(i+">"+template_names[i]+"\n"+template_storage[i]+"\n\n");
			}
		}
	}
	/*
	 * purpose: to clean_up all data stored, except templates
	 */
	function clean_up() {
		this.task.run_sync("core", "ui_container", "clean_up");
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
