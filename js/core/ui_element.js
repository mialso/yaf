;(function(glob) {
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = {
		name: "ui_element",
		dependency: ["err", "log",]
	};
	// create app resources

	// load module consrtuctor to app
	var app = glob.app;
	app.module["ui_element"] = UI_element;

	// module constructor
	function UI_element() {
		this.self_test = test;
		this.dependencies = module_data.dependency;
		Object.defineProperty(this, "dom", {
			set: add_to_dom,
			get: function() {return dom_tree}
		});
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
		var success = 0;
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
			app.tst.error = {
				module: "ui_element",
				func: "html_from_model",
				scope: "model =  "+JSON.stringify(model),
				result: result
			};
			
			return 0;
		} else {
			return 1;
		}
	}
})(window);
