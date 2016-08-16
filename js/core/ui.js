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
	var ui_path = "ui/";
	var ui_ext = ".html";

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;
	// create module resources
	var models = {};

	// module constructor
	function UI() {
		this.push_to_dom = push_to_dom;
		Object.defineProperty(this, "model", {
			set: model_add,
			get: function() {return models;}
		});
	}
	function push_to_dom(arr) {
		arr.forEach(function(name, ind) {
			if (models[name]) {
				core.ui_element.dom = models[name];	
			} else {
				model_add(name);
			}
		});
	}
	function model_add(name) {
		// get template if absent
		if (models.name) {
			return;
		}
		var handler = model_from_string(name);
		core.net.get_req(ui_path+name+ui_ext, handler);
	}
	function model_from_string(name) {
		return function(data) {
			var arr = data.split("|");
			// parse data to create template
			if (0 >= arr.length) {
				// nothing to do
				return;
			} else if (1 === arr.length) {
				// simple html
				models[name] = {};
				models[name].html = arr;
			} else {
				// main parser
				models[name] = {};
				models[name].html = [];
				for (var i =0; i < arr.length; ++i) {
					if ("@" === arr[i][0]) {
						var attr = arr[i].slice(1);
						models[name].attrs = {};
						models[name].attrs[attr] = {};
						models[name].attrs[attr].data = null;
						models[name].attrs[attr].ind = i;
						models[name].html.push(null);
					} else {
						models[name].html.push(arr[i]);
					}
				}
			}
			core.ui_element.dom = models[name];	
		}
	}
	function test() {
		var success = 255;
		success = test_model_from_string("test_ui", "<html><p>|@test_attr|</p></html>");
		return success;
	}
	function test_model_from_string(name, string) {
		var handler = model_from_string(name);
		handler(string);
		if (models[name].attrs["test_attr"].data === null && models[name].html[0] === "<html><p>" && models[name].html[1] === null && models[name].html[2] === "</p></html>") {
			delete models[name];
			return 0;
		} else {
			core.tst.error = {
				module: "ui",
				func: "template_request_handler",
				scope: "some_name = "+name+", string = "+string,
				result: models
			};
			delete models[name];
			return 1;
		}
	}
})(window);
