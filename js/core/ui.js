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
	var message = ["ui", ""];

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;
	// create module resources
	var log = new core.Logger("ui");

	// module constructor
	function UI() {
		Object.defineProperty(this, "ready", {
			set: model_ready,
			get: function() {return null;}
		});
		Object.defineProperty(this, "model", {
			set: set_model,
			get: function() {return true;}
		});
		Object.defineProperty(this, "container", {
			set: container_add_element,
			get: function() {return true;}
		});
		this.containers = containers;
		this.ui = ui;
	}
	function container_add_element([cont_name, el_name]) {
		containers[cont_name].insert(el_name);
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

		// first time modules initialization
		if (!containers.body) {
			var app_conf_string = "body|guest|$body:header,main,footer"
			//ui = new core.ui_element.Element("user>guest", "body", app_conf_string);
			new core.ui_element.Element("user>guest", "body", app_conf_string);
		}

		// invalid ui_model, exit
		if (0 === ui_names.length) {
			log.error = func+"invalid ui_model";
			return;
		}
		// for each element name
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
