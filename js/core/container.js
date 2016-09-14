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
/*
	var message = ["ui_container"];
*/
	core.core_loader.module = module_data;

	// module constructor
	function UI_container() {
		this.Container = Container;
	}
	function Container(name, type, elems) {
		this.name = name;
		//this.log = new core.Logger(this.name);
		//this.log = new core.log.Model(["container", this.name]);
		this.global_id = name;
/*
		this.message = message.concat([this.name]);
*/
		var func = "Container(): ";
		this.type = type;
		switch (this.type) {
			case "single":
				this.insert = core.task.create(["insert", change_element]);
				this.change = core.task.create(["change", replace_inner_html]);
				this.update = core.task.create(["update", replace_inner_html]);
				break;
			case "named":
				this.insert = core.task.create(["insert", add_element]);
				break;
			case "list": 
				this.insert = core.task.create(["insert", append_element]);
				break;
			default:
				log.error = func+"unknown container type \""+type+"\"";
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
		this.parent_ready = core.task.create(["parent_ready", add_to_parent]);
/*
		Object.defineProperty(this, "parent_ready", {
			set: add_to_parent.bind(this),
			get: function() { return this.parent_ready_bool;}
		});
*/
	}
	/*
	 * purpose: to be called once container is in DOM to start element add
	 */
	function add_to_parent(bool) {
		var func = "parent_ready(): ";
		this.parent_ready_bool = bool;
		if (!this.parent_ready_bool) {
			this.task.error(func+"is called with false argument");
			return;
		}
		if (this.queue[0]) this.insert(this.queue[0]);
		for (var i = 0; i < this.elems.length; ++i) {
			if (undefined !== this.ready[i] || null !== this.ready[i]) {
				this.queue[i] = this.ready[i];
				this.ready[i] = null;
			}
		}
	}
	/*
	 * purpose: to add elements to list type container
	 */
	function append_element(elem) {
		var func = "append_element(): ";
		if (elem_is_not_valid.call(this, elem)) return;

		var ind;
		if (-1 === (ind = this.elems.indexOf(elem.model.name+elem.model.id))) {
			ind = this.elems.push(elem.model.name+elem.model.id) -1;
		}
		// check if parent is not in dom and push element to queue
		if (!this.parent_ready_bool) {
			this.task.debug(func+"elemenet \""+elem.name+"\" in queue["+ind+"];");
			this.queue[ind] = elem;
			return;
		}
		// check if elements are waiting in queue
		var start_insert = ind;
		while (this.queue[start_insert-1]) {
			--start_insert;
		}
		// push elements to dom 
		insert_next.call(this, start_insert, elem);
	}
	/*
	 * purpose: to insert element in 'single' container
	 */
	function change_element(elem) {
		var func = "change_element(): ";
		if (elem_is_not_valid.call(this, elem)) return;

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
			this.task.error(func+"parent is not ready");
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
	/*
	 * purpose: to change dom element inner HTML
	 */
	function replace_inner_html(ind, elem) {
		var func = "replace_inner_html(): ";
		if (null === ind || !elem) {
			this.task.error(func+"arguments validation failed;");
			return;
		}
		if (!glob.document.querySelector(this.head)) {
			this.task.error(func+"container parent is not in dom: "+this.head+">"); 
			return;
		}
		var string = html_from_ui_element.call(this, elem);
		glob.document.querySelector(this.head).innerHTML = string;
		this.ready[ind] = elem;
		//this.queue[ind] = null;

		this.task.run_async("core", "ui", "in_dom", elem);
/*
		core.message = this.message.concat(["ui", "in_dom", elem]);
*/
	}
	/*
	 * purpose: to check element dependencies
	 * context: Container
	 */
	function elem_is_not_valid(elem) {
		var func = "check_elem_dependecies_fail(): ";
		if (!elem.name) {
			this.task.error(func+"elem.name is not valid ="+elem.name+";");
			return true;
		}
		return false;
	}
	function add_element(elem) {
		var func = "add_element(): ";
		if (elem_is_not_valid.call(this, elem)) return;

		// named container
		if (0 === this.elems.length) {
			this.task.error(func+"no elements names in elems;");
			return;
		}
		// TODO update element naming
		var ind = this.elems.indexOf(elem.name);
		//var ind = this.elems.indexOf(elem.name.split("_").slice(1).join("_"));
		if (-1 === ind) {
			this.task.error(func+"elem.name \""+elem.name+"\" not found in elems =["+this.elems+"]"); 
			return;
		}
		this.task.debug("elem.name ="+elem.name+", ind ="+ind+";");
		// common part
		if (!this.parent_ready_bool) {
			this.queue[ind] = elem;
			return;
		}
		// named container
		if (this.ready[ind-1] || (0 === ind)) {
			insert_next.call(this, ind, elem);
		} else {
			this.queue[ind] = elem;
		}
	}
	function insert_next(ind, elem) {
		var func = "insert_next(): ";
		if (!glob.document.querySelector(this.head)) {
			this.task.error(func+"container parent is not in dom: "+this.head+">"); 
			return;
		}
		var string = html_from_ui_element.call(this, elem);
		glob.document.querySelector(this.head).insertAdjacentHTML("beforeend", string);

		this.task.run_async("core", "ui", "in_dom", elem);
/*
		core.message = this.message.concat(["ui", "in_dom", elem]);
*/
		this.ready[ind] = elem;
		this.queue[ind] = null;
		if (this.queue[ind+1]) {
			insert_next.call(this, ind+1, this.queue[ind+1]);
		}
	}
	function html_from_ui_element(ui_element) {
		var func = "html_from_ui_element(): ";
		if (!ui_element) {
			this.task.error(func+"no element ="+ui_element+";");
			return;
		}
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
		this.task.debug(func+" RESULT: "+result);
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
