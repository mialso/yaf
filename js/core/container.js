;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"ui_container",
		["err", "log",],
		UI_container,
		test
	];
	// create app resources

	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("ui_container");
	var message = ["ui_container"];
	core.core_loader.module = module_data;

	// module constructor
	function UI_container() {
		this.Container = Container;
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
		var slf = this;
		if (("named" === slf.type) && (undefined !== slf.queue[0]) && (null !== slf.queue[0])) {
			slf.insert(slf.queue[0]);
		} else if ("list" === slf.type) {
			slf.queue.forEach(function(el) {
				if (undefined !== el && null !== el) slf.insert(el);
			});
		}
		for (var i = 0; i < this.elems.length; ++i) {
			if (undefined !== this.ready[i] || null !== this.ready[i]) {
				this.queue[i] = this.ready[i];
				this.ready[i] = null;
			}
		}
	}
	function append_element(elem) {
		var func = "append_element(): ";
		if (check_elem_dependencies_fail(this, elem)) return;
		this.log.info = func+"element \""+elem.name+"\"";
		var ind;
		if (-1 === (ind = this.elems.indexOf(elem.model.id))) {
			ind = this.elems.push(elem.model.id) -1;
		}
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

		// change element functionality
		// check if default was already in dom(first time init)
		if (undefined === this.ready[0] || null === this.ready[0]) {
			if (undefined !== this.queue[0]) {
				this.change(0, this.queue[0]);
			}
		}
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
*/
})(window);
