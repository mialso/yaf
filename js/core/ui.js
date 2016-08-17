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
	var models = {
		main: {}
	};		

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;
	// create module resources
	var models = {
		main: {
			ready: 0,
			parnt: ".main",
			elems: []
		}
	};

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
	}
	function set_model(ui_model) {
		console.log("core.ui.set_model("+JSON.stringify(ui_model)+")");
		var ui_names = Object.keys(ui_model);
		// invalid ui_model, exit
		if (0 === ui_names.length) {
			// TODO error
			console.log("core.ui.set_model error 1");
			return;
		}
		for (var i =0; i < ui_names.length; ++i) {
			var elems = ui_model[ui_names[i]];
			console.log("core.ui.set_model("+JSON.stringify(ui_model)+") elems = "+elems);
			if (0 === elems.length) {
				// TODO error
				console.log("core.ui.set_model error 2");
				continue;
			}
			if (undefined === models[ui_names[i]]) {
				// TODO error = no such parent
				console.log("core.ui.set_model error 3");
				continue;
			}
			for (var k=0; k < elems.length; ++k) {
				var new_elem = new core.ui_element.Element(ui_names[i], elems[k]);
				console.log("core.ui.set_model new_elem = %o", new_elem);
				models[ui_names[i]].elems.push(new_elem);
			}
		}
		
	}
	function model_ready(name) {
		console.log("core.ui.model_ready(%s)", name);
		++models[name].ready;
		if (models[name].ready === models[name].elems.length) {
			add_to_dom(models[name]);
		}
	}
	function add_to_dom(model) {
		console.log("core.ui.add_to_dom(%o)", model);
		var html_string;
		for (var i =0; i < model.elems.length; ++i) {
			html_string = html_from_ui_element(model.elems[i]);
			glob.document.querySelector(model.parnt).insertAdjacentHTML("beforeend", html_string);
		}
	}
	function html_from_ui_element(ui_element) {
		console.log("core.ui.html_from_ui_element(%o)", ui_element);
		if (ui_element.attrs) {
		Object.keys(ui_element.attrs).forEach(function(attr, ind) {
			if (ui_element.attrs[attr].data) {
				ui_element.html[ui_element.attrs[attr].ind] = ui_element.attrs[attr].data;
			}
		});
		}
		return ui_element.html.join("");
	}
	function test() {
		var success = 255;
		success = test_html_from_ui_element();
		return success;
	}
	function test_html_from_ui_element() {
		var model = {
			html: ["<html><p>", "", "</p></html>"],
			attrs: {
				name: {
					data: "mik",
					ind: 1
				}
			}
		};
		var result = html_from_ui_element(model);
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
