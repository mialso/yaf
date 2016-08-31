;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;

	// define static data
	var module_data = [
		"ui",
		["err", "log", "net", "ui_element"],
		UI,
		test
	];
	var containers = {};
	var ui = {};
	var el_queue= {};
	var message = ["ui", ""];
	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("ui");
	core.core_loader.module = module_data;

	// create module resources

	// module constructor
	function UI() {
		Object.defineProperty(this, "ready", {
			set: model_ready,
			get: function() {return null;}
		});
		Object.defineProperty(this, "update", {
			set: update_element,
			get: function() { return true;}
		});
		Object.defineProperty(this, "model", {
			set: set_model,
			get: function() {return true;}
		});
		Object.defineProperty(this, "element", {
			set: add_element,
			get: function() {return true;}
		});
		this.ui = ui;
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
			elem.containers.forEach(function(cont) {
				log.info = func+"container \""+cont.name+"\" added";
				containers[cont.name] = cont;
				if ("body" === cont.name) {
					cont.parent_ready = true;
				}
				if (undefined !== el_queue[cont.name]) {
					while(0 < el_queue[cont.name].length) {
						log.info = func+"element \""+el_queue[cont.name][0].name+" inserted to container \""+cont.name+"\"";
						containers[cont.name].insert(el_queue[cont.name].shift());
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
	function model_ready([model, name]) {
		var func = "model_ready(): ";
		log.info = func+"model ="+model+", name ="+name;
		if ("body" === model) {
			log.info = func+"model = body, return";
			return;
		}
		core.model_data = message.concat([model, "ui_ready", name]);
	}
	function set_model([model_data, ui_names]) {
		var func = "set_model(): ";
		log.info = func+"model data ="+model_data+", ui_names ="+JSON.stringify(ui_names);
		var m_arr = model_data.split(">");
		var model = m_arr.shift();

		// invalid ui_model, exit
		if (undefined === ui_names || 0 === ui_names.length) {
			log.error = func+"invalid ui_model";
			return;
		}

		// clean up
		containers = {};
		el_queue= {};
		glob.document.body.innerHTML = "";

		// create elements
		for (var i =0; i < ui_names.length; ++i) {
			var element_name = ui_names[i];
			log.info = func+"new model <"+model+"> element \""+element_name;
			//core.model_data = message.concat([model, "ui", new core.ui_element.Element(model_data, element_name)]);
			new core.ui_element.Element(model_data, element_name);
		}
	}
	function test() {
		return 255;
	}
})(window);
