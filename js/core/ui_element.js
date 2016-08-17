;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"ui_element",
		["err", "log",],
		UI_element,
		test
	];
	// create app resources
	var ui_path = "ui/";
	var ui_ext = ".html";

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;

	// module constructor
	function UI_element() {
		this.Element = Element;
	}
	function Element(base, name) {
		console.log("core.ui_element.Element("+base+", "+name+")");
		var html = [];
		var attrs = {};
		Object.defineProperty(this, "html", {
			set: function(d) { return null; },
			get: function() {return html; }
		});
		Object.defineProperty(this, "attrs", {
			set: function(d) { return null; },
			get: function() {return attrs; }
		});
		
		function model_from_string(data) {
			var arr = data.split("|");
			// parse data to create template
			if (0 >= arr.length) {
				// nothing to do
				return;
			} else if (1 === arr.length) {
				// simple html
				html = arr;
			} else {
				// main parser
				for (var i =0; i < arr.length; ++i) {
					if ("@" === arr[i][0]) {
						var attr = arr[i].slice(1);
						attrs[attr] = {};
						attrs[attr].data = null;
						attrs[attr].ind = i;
						html.push(undefined);
					} else {
						html.push(arr[i]);
					}
				}
			}
			console.log("core.ui_element.Element html: %s; attrs: %o", html, attrs);
			core.ui.ready = base;
		}
		core.net.get_req(ui_path+name+ui_ext, model_from_string);
	}
	function test() {
/*
		var success = 255;
		success = test_model_from_string("test_ui", "<html><p>|@test_attr|</p></html>");
		return success;
*/
		return 1;
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
