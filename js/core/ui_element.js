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
	var log = new core.Logger("ui_element");
	var message = ["ui_element"];
/*
	var el_log = {};
	var c_log = {};
*/
	core.core_loader.module = module_data;

	// module constructor
	function UI_element() {
		this.Element = Element;
		Object.defineProperty(this, "l", {
			set: function(d) { return null; },
			get: function() {return log;}
		});
/*
		Object.defineProperty(this, "el_log", {
			set: function(d) { return null; },
			get: function() { return el_log; }
		});
		Object.defineProperty(this, "c_log", {
			set: function(d) { return null; },
			get: function() { return c_log; }
		});
*/
	}
	function Element(model_data, name, config_string) {
		log.info = "Element(): new "+model_data+": "+name+" = "+config_string;

		this.name = name;
		//el_log[name] = new core.Logger(name);
		//this.log = el_log[name];
		this.log = new core.Logger(name);

		this.message = message.concat(["Element:"+name]);
		var ready = false;
		this.parnt = "";
		this.roles = [];
		this.html = [];
		this.attrs = {};
		//var actions = {};
		this.action = {};
		this.containers = [];
		//this.containers = {};

		this.model = new Model(model_data);
/*
		var model_arr = model.split(">");
		this.model = model_arr.shift();
		this.model_id = model_arr.shift();
*/
		Object.defineProperty(this, "actions", {
			//set: set_action,
			set: function(d) { 
				(undefined === this.action[d[0]])
					//? this.action[d[0]] = new Action(d)
					? this.log.error = "Element(): {actions}: attempt to update undefine action ="+JSON.stringify(d)
					: this.action[d[0]].update(d);
			},
			get: function() {return true; }
		});
		Object.defineProperty(this, "ready", {
			set: function(d) { ready = d; if (ready) { core.ui.ready = [model_data, name];}},
			get: function() { return ready;}
		});
/*
		function reload() {
			//el_log[name].info = "reload(): ";
			this.log.info = "reload(): ";
		}
		function set_action([action, data]) {
			if (!actions[action]) {
				actions[action] = {};
			}
			if (!data) {
				//el_log[this.name].error = "set_action(): no data, data = "+data;
				this.log.error = "set_action(): no data, data = "+data;
				return;
			}
			//el_log[this.name].info = "set_action(): action = " + action+", data = "+data;
			this.log.info = "set_action(): action = " + action+", data = "+data;
			actions[action].data = data;
			reload();
		}
*/
		if (config_string) {
			element_from_string.bind(this)(config_string);
		} else {
			core.message = this.message.concat(["net", "req_get", [ui_path+name+ui_ext, element_from_string.bind(this)]]);
		}
	}
	function Action(action_data_arr) {
		var func = "Action(): ";
		log.info = func+"new ="+JSON.stringify(action_data_arr);

		this.name = action_data_arr[0];
		this.data = action_data_arr[1];
		this.ind = action_data_arr[2];
		
		this.update = function(data_arr) {
			log.info = "Action(): \""+this.name+"\" update(): data_arr ="+JSON.stringify(data_arr);
			this.data = data_arr[1];
		}
	}
	function Model(model_data) {
		log.info = "Model(): new ="+JSON.stringify(model_data);
		//if (undefined === model_data || !(model_data instanceof String)) {
		if ((undefined === model_data) || (typeof model_data !== "string")) {
			log.error = "Model(): <model_data> is not valid: "+model_data;
			return;
		}
		var data_array = model_data.split(">");
		this.name = data_array[0];
		this.id = (2 === data_array.length) ? data_array[1] : null;
	}
	function element_from_string(data) {
		var func = "element_from_string(): ";
		if (!this.log) {
			log.error = func+"el_log["+this.name+"] is "+this.log;
			return;
		}
		//var actions = this.actions;
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
					var action_name = arr[i].slice(1);
					/*
					if (!actions[action_name]) {
						actions[action_name] = {};
						actions[action_name].data = null;
					}
					actions[action_name].ind = i;
					*/
					this.action[action_name] = new Action([action_name, null, i]);
					this.html.push(null);
					break;
				case "$": 	// container
					// split container and children
					var data_arr = arr[i].slice(1).split(":");
					// get children if any
					var children = [];
					if (1 < data_arr.length) {
						children = data_arr[1].split(",");
					}
					var cont_data = data_arr[0].split(">");
					if (2 !== cont_data.length) {
						this.log.error = func+"wrong container data provided ="+data_arr[0];
						break;
					}
					var name = cont_data[0];
					var type = cont_data[1];

					if (this.containers[name]) {
						this.log.error = func+"double container \""+name+"\" initialization";
						break;
					}
					this.containers.push(new Container(name, type, children));
					this.html.push(null);
					break;
				default:
					this.html.push(arr[i]);
			}
		}
		this.log.info = func+"html: "+this.html+", attrs: "+this.attrs+", actions: "+JSON.stringify(this.action);
		core.model_data = this.message.concat([this.model.name, "ui_ready", this]);
	}
	function Container(name, type, elems) {
		this.name = name;
		//c_log[this.name] = new core.Logger(this.name);
		//this.log = c_log[this.name];
		this.log = new core.Logger(this.name);
		var func = "Container(): ";
		this.type = type;
		switch (this.type) {
			case "single":
				this.insert = change_element;
				this.change = replace_inner_html;
				this.update = replace_inner_html;
				break;
			case "named":
				this.insert = add_element;
				break;
			case "list": 
				this.insert = append_element;
				break;
			default:
				log.error = "Container(): unknown container type \""+type+"\"";
				this.insert = undefined;
				break;
		}
		log.info = func+"new <"+this.name+">: type ="+type+"; elems ="+elems;
		this.prnt = name.split("_").slice(0,-1).join("_");

		this.head = name.split("_").join(" .");

		this.elems = elems;
		//this.elems[elems.length-1].slice(0,-1);
		//this.insert = add_element;
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
		this.log.info = func+bool+": \""+this.name+"\": "+JSON.stringify(this)+";";
		this.parent_ready_bool = bool;
		if (!this.parent_ready_bool) {
			return;
		}
/*
		if (undefined !== this.queue[0]) {
			this.insert(this.queue[0]);
		}
*/
		var slf = this;
		if (("named" === slf.type) && (undefined !== slf.queue[0]) && (null !== slf.queue[0])) {
			slf.insert(slf.queue[0]);
		} else if ("list" === slf.type) {
			slf.queue.forEach(function(el) {
				if (undefined !== el && null !== el) slf.insert(el);
			});
		//console.log("XXXXXXXXXX: queue = "+JSON.stringify(this.queue)+"; ready ="+JSON.stringify(this.ready));
		}
		//console.log("XXXXXXX: cont ="+this.name+"; length: elems ="+this.elems.length+"; queue ="+this.queue.length+"; ready ="+this.ready.length);
		for (var i = 0; i < this.elems.length; ++i) {
			//if (null === this.queue[i] && null !== this.ready[i]) {
			if (undefined !== this.ready[i] || null !== this.ready[i]) {
				this.queue[i] = this.ready[i];
				this.ready[i] = null;
			}
		}
		//this.elems = [];
	}
	function append_element(elem) {
		var func = "append_element(): ";
		if (check_elem_dependencies_fail(this, elem)) return;
		this.log.info = func+"element \""+elem.name+"\"";
		var ind;
		if (-1 === (ind = this.elems.indexOf(elem.model.id))) {
			ind = this.elems.push(elem.model.id) -1;
		}
		//var ind = this.elems.push(elem.name) -1;
		if (!this.parent_ready_bool) {
			this.log.info = func+"elemenet \""+elem.name+"\" in queue["+ind+"];";
			this.queue[ind] = elem;
			return;
		}
		insert_next.bind(this)(ind, elem);
	}
	function change_element(elem) {
		var func = "change_element(): ";
		if (check_elem_dependencies_fail(this, elem)) return;
		//this.log.error = func+"is not implemented yet";
		this.log.info = func+"element \""+elem.name+"\"";

		// check default element is present, else TODO make default first one
		if (0 === this.elems.length) {
			this.elems[0] = elem.name;
		}
		// mark place for default element
		if (0 === this.queue.length) {
			// this is to hold place for default element = always 0
			this.queue[0] = null;
		}
		// calculate index the way that default element is always 0
		var ind = (this.elems[0] === elem.name) ? 0 : this.queue.length;
		// always in queue
		this.queue[ind] = elem;
		this.elems[ind] = elem.name;
		if (!this.parent_ready_bool) {
			return;
		}
		//insert_next.bind(this)(ind, elem);

		// change element functionality
		// check if default was already in dom(first time init)
		//if (undefined === this.ready[0]) {
		if (undefined === this.ready[0] || null === this.ready[0]) {
			if (undefined !== this.queue[0]) {
			//if (undefined !== this.queue[0] && null !== this.queue[0]) {
				this.change(0, this.queue[0]);
			}
			//(0 === ind) ? this.change(ind, this.queue[0]) : this.queue[ind] = elem;
		}// else {
			// this is the case when updated by user
			//this.change(ind, this.queue[ind]);
		//}
	}
	function replace_inner_html(ind, elem) {
		var func = "replace_inner_html(): ";
		if (null === ind || !elem) {
			this.log.error = func+"ind ="+ind+", elem ="+JSON.stringify(elem)+";";
			return;
		}
		this.log.info = func+" queue["+ind+"] elem ="+JSON.stringify(elem)+" to be updated;";
		if (!glob.document.querySelector(this.head)) {
			this.log.error = func+"container parent is not in dom: "+this.head+">"; 
			return;
		}
/*
		for (var i = 0; i < this.ready.length; ++i) {
			if (this.ready[i]) {
				this.queue[i] = this.ready[i];
				this.ready[i] = null;
			}
		}
*/
/*
		var q = this.queue;
		var r = this.ready;
		this.ready.forEach(function(elem, ind) {
			if (elem) {
				//this.queue[ind] = elem;
				q[ind] = elem;
				//this.ready[ind] = null;
				r[ind] = null;
			}
		});
*/
		var string = html_from_ui_element.bind(this)(elem);
		glob.document.querySelector(this.head).innerHTML = string;
		this.ready[ind] = elem;
		//this.queue[ind] = null;
		if (0 < elem.containers.length) {
			elem.containers.forEach(function(container) {
				container.parent_ready = true;
			});
		}
	}
	function check_elem_dependencies_fail(slf, elem) {
		var func = "check_elem_dependecies_fail(): ";
		log.info = func+"element \""+elem.name+"\"";
		if (!slf.head || !slf.log) {
			log.error = func+"log["+slf.head+"] is "+slf.log;
			return true;
		}
		if (!elem.name) {
			slf.log.error = func+"elem.name ="+elem.name;
			return true;
		}

	}
	function add_element(elem) {
		var func = "add_element(): ";
		if (check_elem_dependencies_fail(this, elem)) return;
		this.log.info = func+"element \""+elem.name+"\"";
		//common part
/* moved to check_eleme_dependencies_fail()
		if (!this.head || !this.log) {
			log.error = func+"log["+this.head+"] is "+this.log;
			return;
		}
		if (!elem.name) {
			this.log.error = func+"elem.name ="+elem.name;
			return;
		}
*/
		// named container
		if (0 === this.elems.length) {
			this.log.error = "no elements names in elems: "+JSON.stringify(this.elems);
			return;
		}
		var ind = this.elems.indexOf(elem.name);
		if (-1 === ind) {
			this.log.error = func+"elem.name ="+elem.name+" not found in elems ="+this.elems+">"; 
			return;
		}
		this.log.info = "elem.name ="+elem.name+", ind ="+ind;
		// common part
		if (!this.parent_ready_bool) {
			this.queue[ind] = elem;
			return;
		}
/* moved to 'insert_next()
		if (!glob.document.querySelector(this.head)) {
			this.log.error = func+"no such element in dom: "+this.head+">"; 
			return;
		}
*/
		// named container
		if (this.ready[ind-1] || (0 === ind)) {
			insert_next.bind(this)(ind, elem);
		} else {
			this.queue[ind] = elem;
		}
	}
	function insert_next(ind, elem) {
		var func = "insert_next(): ";
		if (!glob.document.querySelector(this.head)) {
			this.log.error = func+"container parent is not in dom: "+this.head+">"; 
			return;
		}
		var string = html_from_ui_element.bind(this)(elem);
/*
		var q = this.queue;
		var r = this.ready;
		this.ready.forEach(function(elem, ind) {
			if (elem) {
				//this.queue[ind] = elem;
				q[ind] = elem;
				//this.ready[ind] = null;
				r[ind] = null;
			}
		});
*/
		glob.document.querySelector(this.head).insertAdjacentHTML("beforeend", string);
		// TODO this is the place to add container if any
		if (0 < elem.containers.length) {
			elem.containers.forEach(function(container) {
				container.parent_ready = true;
			});
		}
		this.ready[ind] = elem;
		this.queue[ind] = null;
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
		if (!ui_element) {
			log.error = func+"no element ="+ui_element;
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
		if (ui_element.action) {
			Object.keys(ui_element.action).forEach(function(attr, ind) {
				if (ui_element.action[attr].data) {
					ui_element.html[ui_element.action[attr].ind] = ui_element.action[attr].data;
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
