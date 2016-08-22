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

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;
	// create module resources
	var containers = {};
	var ui = {};

	// module constructor
	function UI() {
		Object.defineProperty(this, "ready", {
			set: model_ready,
			get: function() {return null;}
		});
		Object.defineProperty(this, "model", {
			set: set_model,
			get: function() {return null;}
		});
		this.containers = containers;
		this.ui = ui;
	}
	function model_ready([model, name]) {
		console.log("<ui>: model_ready(): model = %s, name = %s", model, name);
		if ("body" === model) {
			
			return;
		}
		glob.app[model].ui_ready = name;
	}
	function set_model([model, ui_names]) {
		// first time modules initialization
		if (!containers.body) {
			var app_conf_string = "body|guest|$body:header,main,footer"
			ui = new core.ui_element.Element("body", "body", app_conf_string);
		}

		console.log("core.ui.set_model("+JSON.stringify(ui_names)+")");
		// invalid ui_model, exit
		if (0 === ui_names.length) {
			console.log("core.ui.set_model error 1");
			return;
		}
		// for each element name
		for (var i =0; i < ui_names.length; ++i) {
			var element_name = ui_names[i];
			//var elems = ui_model[model_name];
			console.log("<ui>: set_model(): new model_name = %s", element_name);
			glob.app[model].ui = [element_name, new core.ui_element.Element(model, element_name), null];
		}
	}
	function test() {
		return 255;
	}
})(window);
