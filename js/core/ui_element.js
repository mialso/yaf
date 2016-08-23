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
	var message = ["ui_element"];

	// module constructor
	function UI_element() {
		this.Element = Element;
	}
	function Element(model, name, config_string) {
		console.log("core.ui_element.Element("+model+", "+name+")");
		this.message = message.concat(["Element:"+name]);
		this.parnt = "";
		this.roles = [];
		this.html = [];
		this.attrs = {};
		var actions = {};
		this.containers = {};
		this.name = name;
		Object.defineProperty(this, "actions", {
			set: set_action,
			get: function() {return actions; }
		});
		Object.defineProperty(this, "ready", {
			set: function(d) { ready = d; if (ready) { core.ui.ready = [model, name];}},
			get: function() { return ready;}
		});
		function reload() {
			console.log("<ui_element> reload()");
		}
		function set_action([action, data]) {
			if (!actions[action]) {
				console.log("<ui_element> set_action(): error 1, action = %s, actions = %o, actions[action] = %o", action, actions, actions[action]);
				actions[action] = {};
				//return;
			}
			if (!data) {
				console.log("<ui_element> set_action(): error 2");
			}
			console.log("<ui_element>: set_action(): action: %s, data: %s", action, data);
			actions[action].data = data;
			reload();
		}
		if (config_string) {
			model_from_string.bind(this)(config_string);
		} else {
			//core.net.get_req(ui_path+name+ui_ext, this.model_from_string);
			//core.net.get_req(ui_path+name+ui_ext, model_from_string.bind(this));
			core.message = this.message.concat(["net", "req_get", [ui_path+name+ui_ext, model_from_string.bind(this)]]);
		}
	}
	function Container(head, elems) {
		this.head = head;
		this.elems = elems;
		var queue = [];
		var ready = [];
		this.insert = function(elem) {
			var ind = elems.indexOf(elem.name);
			if (-1 === ind) {
				console.log("<ui>: Container: insert() error 1: elem = "+elem);
				return;
			}
			if (!glob.document.querySelector(head)) {
				console.log("<ui>: Container: insert() error 2: parent is not ready: ", head);
				return;
			}
			console.log("<ui_element> Contatiner: insert(): elem.name = " + elem.name + ", ind="+ ind);
			if (0 === ind || ready[ind-1]) {
				insert_next(ind, elem);
			} else {
				queue[ind] = elem;
			}
		}
		function insert_next(ind, elem) {
			var string = html_from_ui_element(elem);
			glob.document.querySelector(head).insertAdjacentHTML("beforeend", string);
			ready[ind] = elem.name;
			if (queue[ind]) {
				queue[ind] = undefined;
			}
			if (queue[ind+1]) {
				insert_next(ind+1, queue[ind+1]);
			}
		}
	}
	function model_from_string(data) {
		var actions = this.actions;
		var arr = data.split("|");
		// parse data to create template
		if (3 > arr.length) {
			// nothing to do
			console.log("<ui_element>: model_from_string(): error 1, %s", data);
			return;
		}
		// main parser
		for (var i =0; i < arr.length; ++i) {
			if (0 === i) {
				this.parnt = arr[i];
				this.html.push(null);
				continue;
			}
			if (1 === i) {
				this.roles = arr[i].split(",");
				this.html.push(null);
				continue;
			} 
			switch (arr[i][0]) {
				case "@":	// data
					var attr = arr[i].slice(1);
					if (!this.attrs[attr]) {
						this.attrs[attr] = {};
						this.attrs[attr].data = null;
					}
					this.attrs[attr].ind = i;
					this.html.push(null);
					break;
				case "#":	// action
					var action = arr[i].slice(1);
					if (!actions[action]) {
						actions[action] = {};
						actions[action].data = null;
					}
					actions[action].ind = i;
					this.html.push(null);
					break;
				case "$": 	// container
					var cont_name = arr[i].slice(1);
					var data_arr = arr[i].slice(1).split(":");
					var children = [];
					if (data_arr && 1 < data_arr.length) {
						cont_name = data_arr[0];
						children = data_arr[1].split(",");
					}
					if (!this.containers[cont_name]) {
						this.containers[cont_name] = new Container(cont_name.split("_").join(" ."), children);
					}
					//containers[cont_name].head = cont_name.split("_").join(" .");
					core.ui.containers[cont_name] = this.containers[cont_name];
					break;
				default:
					this.html.push(arr[i]);
			}
		}
		console.log("core.ui_element.Element html: %s; attrs: %o; actions: %o", this.html, this.attrs, this.actions);
		//glob.app[model].ui_ready = true;
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
		if (ui_element.actions) {
		Object.keys(ui_element.actions).forEach(function(attr, ind) {
			if (ui_element.actions[attr].data) {
				ui_element.html[ui_element.actions[attr].ind] = ui_element.actions[attr].data;
			}
		});

		}
		console.log("{{{{}}}}: %o", ui_element.html);
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
/*
	function test() {
		var success = 255;
		success = test_model_from_string("test_ui", "<html><p>|@test_attr|</p></html>");
		return success;
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
*/
})(window);
