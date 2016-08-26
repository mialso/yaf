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
	var log = new core.Logger("ui_element");
	var el_log = {};
	var c_log = {};

	// module constructor
	function UI_element() {
		this.Element = Element;
		Object.defineProperty(this, "l", {
			set: function(d) { return null; },
			get: function() {return log;}
		});
		Object.defineProperty(this, "el_log", {
			set: function(d) { return null; },
			get: function() { return el_log; }
		});
		Object.defineProperty(this, "c_log", {
			set: function(d) { return null; },
			get: function() { return c_log; }
		});
	}
	function Element(model, name, config_string) {
		log.info = "Element(): new "+model+": "+name+" = "+config_string;

		this.name = name;
		el_log[name] = new core.Logger(name);
		this.log = el_log[name];

		this.message = message.concat(["Element:"+name]);
		var ready = false;
		this.parnt = "";
		this.roles = [];
		this.html = [];
		this.attrs = {};
		var actions = {};
		this.containers = [];
		//this.containers = {};
		var model_arr = model.split(">");
		this.model = model_arr.shift();
		this.model_id = model_arr.shift();
		Object.defineProperty(this, "actions", {
			set: set_action,
			get: function() {return actions; }
		});
		Object.defineProperty(this, "ready", {
			set: function(d) { ready = d; if (ready) { core.ui.ready = [model, name];}},
			get: function() { return ready;}
		});
		function reload() {
			el_log[name].info = "reload(): ";
		}
		function set_action([action, data]) {
			if (!actions[action]) {
				actions[action] = {};
			}
			if (!data) {
				el_log[this.name].error = "set_action(): no data, data = "+data;
				return;
			}
			el_log[this.name].info = "set_action(): action = " + action+", data = "+data;
			actions[action].data = data;
			reload();
		}
		if (config_string) {
			model_from_string.bind(this)(config_string);
		} else {
			core.message = this.message.concat(["net", "req_get", [ui_path+name+ui_ext, model_from_string.bind(this)]]);
		}
	}
	function model_from_string(data) {
		var func = "model_from_string(): ";
		if (!this.log) {
			log.error = func+"el_log["+this.name+"] is "+this.log;
			return;
		}
		var actions = this.actions;
		var arr = data.split("|");
		// parse data to create template
		if (3 > arr.length) {
			// nothing to do
			this.log.error = func+"data arr.lenght = "+arr.length;
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
				//this.model_id = arr[i];
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
					//var cont_name = arr[i].slice(1);
					var data_arr = arr[i].slice(1).split(":");
					var cont_name = data_arr[0];
					var children = [];
					if (data_arr && 1 < data_arr.length) {
						cont_name = data_arr[0];
						children = data_arr[1].split(",");
					}

					if (!this.containers[cont_name]) {
						//core.ui.containers = [cont_name, new Container(cont_name.split("_").join(" ."), children)];
						//this.containers[cont_name] = new Container(cont_name.split("_").join(" ."), children);
						this.containers.push(new Container(cont_name, children));
					}// TODO else???
					//core.ui.containers[cont_name] = this.containers[cont_name];
					//core.ui.containers = [cont_name, this.containers[cont_name]];
					this.html.push(null);
					break;
				default:
					this.html.push(arr[i]);
			}
		}
		this.log.info = func+"html: "+this.html+", attrs: "+this.attrs+", actions: "+JSON.stringify(actions);
		core.model_data = this.message.concat([this.model, "ui_ready", this]);
	}
	function Container(name, elems) {
		this.name = name;
		c_log[this.name] = new core.Logger(this.name);
		this.log = c_log[this.name];
		var func = "Container(): ";
		log.info = func+"new <"+this.name+">: "+elems;
		this.prnt = name.split("_").slice(0,-1).join("_");

		this.head = name.split("_").join(" .");

		this.elems = elems;
		//this.elems[elems.length-1].slice(0,-1);
		this.insert = add_element;
		this.queue = [];
		this.ready = [];
		this.parent_ready_bool = false;
		Object.defineProperty(this, "parent_ready", {
			set: add_to_parent.bind(this),
			get: function() { return this.parent_ready_bool;}
		});
	}
	function add_to_parent(bool) {
		var func = "parent_ready(): ";
		this.parent_ready_bool = bool;
		if (!this.parent_ready_bool) {
			return;
		}
		if (undefined !== this.queue[0]) {
			this.insert(this.queue[0]);
		}
	}
	function add_element(elem) {
		var func = "add_element(): ";
		log.info = func+"element \""+elem.name+"\"";
		if (!this.head || !this.log) {
			log.error = func+"log["+this.head+"] is "+this.log;
			return;
		}
		if (!elem.name) {
			this.log.error = func+"elem.name ="+elem.name;
			return;
		}
		var ind = this.elems.indexOf(elem.name);
		if (-1 === ind) {
			this.log.error = func+"elem.name ="+elem.name+" not found in elems ="+this.elems+">"; 
			return;
		}
		this.log.info = "elem.name ="+elem.name+", ind ="+ind;
		if (!this.parent_ready_bool) {
			this.queue[ind] = elem;
			return;
		}
		if (!glob.document.querySelector(this.head)) {
			this.log.error = func+"no such element in dom: "+this.head+">"; 
			return;
		}
		if (0 === ind || this.ready[ind-1]) {
			insert_next.bind(this)(ind, elem);
		} else {
			this.queue[ind] = elem;
		}
	}
	function insert_next(ind, elem) {
		var func = "insert_next(): ";
		var string = html_from_ui_element.bind(this)(elem);
		glob.document.querySelector(this.head).insertAdjacentHTML("beforeend", string);
		// TODO this is the place to add container if any
		if (0 < elem.containers.length) {
			elem.containers.forEach(function(container) {
				container.parent_ready = true;
			});
		}
		this.ready[ind] = elem.name;
		this.queue[ind] = undefined;
		if (this.queue[ind+1]) {
			insert_next.bind(this)(ind+1, this.queue[ind+1]);
		}
	}
	function html_from_ui_element(ui_element) {
		var func = "html_from_ui_element(): ";
		if (!this) {
			log.error = func+"this is "+this;
			return;
		}
		this.log.info = func+"ui_element ="+JSON.stringify(ui_element);
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
		var result = ui_element.html.join("");
		this.log.info = func+" RESULT: "+result;
		return result;
	}
	function test() {
		var success = 255;
		//success = test_html_from_ui_element();
		return success;
	}
/*
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
