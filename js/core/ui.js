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
	var models = {};

	// module constructor
	function UI() {
		this.push_to_dom = push_to_dom;
		Object.defineProperty(this, "dom_element", {
			set: push_to_dom,
			get: function() {return null;}
		});
	}
	function push_to_dom(element) {
		console.log("adding element to dom");
		
	}
	function model_add(name) {
		// get template if absent
		if (models.name) {
			return;
		}
		var handler = model_from_string(name);
		core.net.get_req(ui_path+name+ui_ext, handler);
	}
	function add_to_dom(model) {
		var parnt;
		var html_string;
		model.parnt ? parnt = model.parnt : parnt = "body";
		html_string = html_from_model(model);
		glob.document.querySelector(parnt).insertAdjacentHTML("beforeend", html_string);
	}
	function html_from_model(model) {
		if (model.attrs) {
		Object.keys(model.attrs).forEach(function(attr, ind) {
			if (model.attrs[attr].data) {
				model.html[model.attrs[attr].ind] = model.attrs[attr].data;
			}
		});
		}
		return model.html.join("");
	}
	function test() {
		var success = 255;
		success = test_html_from_model();
		return success;
	}
	function test_html_from_model() {
		var model = {
			html: ["<html><p>", "", "</p></html>"],
			attrs: {
				name: {
					data: "mik",
					ind: 1
				}
			}
		};
		var result = html_from_model(model);
		if (result !== "<html><p>mik</p></html>") {
			core.tst.error = {
				module: "ui_element",
				func: "html_from_model",
				scope: "model =  "+JSON.stringify(model),
				result: result
			};
			
			return 1;
		} else {
			return 0;
		}
	}
})(window);
