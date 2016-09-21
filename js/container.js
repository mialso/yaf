;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"ui_container",
		["log", "task"],
		UI_container,
		test
	];
	// create app resources
	var containers = {};
	var el_queue = {};

	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("ui_container");
	core.core_loader.module = module_data;

	// module constructor
	function UI_container() {
		this.global_id = "ui_container>model";
		// interface
		this.update_container = core.task.create(["update_container", update_container]);
		this.create = core.task.create(["create", create_container]);
		this.clean_up = core.task.create(["clean_up", clean_up]);
		// service
		this.get = function() { return JSON.stringify(containers);};
		this.get_conts = function() { return containers;};
		this.get_log = function() { return log;};
	}
	/* 
	 * purspose: clean up
	 */
	function clean_up() {
		containers = {};
	}
	function update_container(elem) {
		var func = "update_container(): ";
		var cont_name = elem.parent_container;
		// if container is not loaded yet, put element to queue
		if (!containers[cont_name]) {
			// create queue if absent
			if (undefined === el_queue[cont_name]) {
				this.task.debug(func+"new el_queue ="+cont_name);
				el_queue[cont_name] = [];
			}
			el_queue[cont_name].push(elem);
			this.task.result = elem.global_id+" in el_queue";
		} else {
			this.task.run_sync("object", containers[cont_name], "update", elem);
		}
	}
	function create_container([name, type, children]) {
		var func = "create_container(): ";
		containers[name] = new Container(name, type, children);
		if ("body" === name) {
			this.task.run_sync("object", containers[name], "parent_ready", true);
		}
		this.task.debug(func+"container \""+name+"\" added;");
		if (undefined !== el_queue[name]) {
			while(0 < el_queue[name].length) {
				this.task.debug(func+"element \""+el_queue[name][0].name+" inserted to container \""+name+"\"");
				this.task.run_sync("object", containers[name], "update", el_queue[name].shift());
			}
		}
	}
	function Container(name, type, elems) {
		this.name = name;
		this.global_id = "container>"+name;
		var func = "Container(): ";

		this.type = type;
		// interface
		this.update = core.task.create(["update", update_element]);
		this.parent_ready = core.task.create(["parent_ready", add_to_parent]);

		// service static functions, to be used by tasks
		this.get_elem_id = function(elem) {
			return elem.name;
		};
		this.get_elem_index = function(el_id) {
			return this.elem_names.indexOf(el_id);
		};
		this.add_element = function(el_id) {
			return this.elem_names.push(el_id)-1;
		};
		// override specific to container type services
		switch (this.type) {
			case "single":
				break;
			case "table":
				break;
			case "named":
				this.add_element = function(el_id) {
					return -1;
				};
				break;
			case "list": 
				break;
			default:
				log.error = func+"unknown container type \""+type+"\"";
				break;
		}
		log.info = func+"new <"+this.name+">: type ="+type+"; elems ="+elems;
		//this.parent_element = name.split("_").slice(0,-1).join("_");

		this.head = name.split("_").join(" .");

		this.elem_names = elems;
		this.elems = [];
		this.loaded = [];
		this.shown = [];

		this.parent_ready_bool = false;
	}
	/*
	* purpose: to update element within container
	* context: Container
	*/
	function update_element(elem) {
		var func = "update_element(): ";
		if (elem_is_not_valid.call(this, elem)) return;
		var el_id = this.get_elem_id(elem);
		var elem_ind = this.get_elem_index(el_id);
		// add element id to container elems
		if (-1 === elem_ind) {
			elem_ind = this.add_element(el_id);
			if ("single" === this.type) {
				elem.show = false;
			}
		}
		if (-1 === elem_ind) {
			this.task.error(func+"unable to add element to container");
			return;
		} else {
			this.task.debug(func+"element added successfully");
		}
		// update element data
		this.elems[elem_ind] = elem;
		this.task.debug(func+"\""+el_id+"["+elem_ind+"]\" updated");
		// mark loaded elements
		this.loaded[elem_ind] = this.elem_names[elem_ind];
		this.task.debug(func+"\""+elem.name+"\" is loaded, ind ="+elem_ind);
		// check if container is in dom already and is able to insert elements
		if (!this.parent_ready_bool) {
			this.task.result = this.loaded[elem_ind]+" is loaded to \""+this.global_id+"\"";
			return;
		}

		if (elem.show) {
			show.call(this, elem_ind);
		} else {
			hide.call(this, elem_ind);
		}
	}
	/*
	 * purpose: to show element
	 * context: Container
	 */
	function show(elem_ind) {
		if (this.shown[elem_ind]) {
			hide.call(this, elem_ind);
		}
		// if new containers added - call parent ready on each
		var elem = this.elems[elem_ind];
		if (0 < elem.containers.length) {
			for (var i = 0; i < elem.containers.length; ++i) {
				var name = elem.containers[i];
				if (!containers[name]) {
					this.task.error("the inserted container \""+name+"\" is "+containers[name]);
					return;
				}
				this.task.run_async("object", containers[name], "parent_ready", true);
			}
		}
		// TODO if change call fails, this should not be true
		this.shown[elem_ind] = true;
		this.task.debug(this.elems[elem_ind].global_id+" is shown ="+this.shown[elem_ind]);

		change.call(this, elem_ind);
	}
	/*
	 * purpose: to hide element
	 * context: Container
	 */
	function hide(elem_ind) {
		this.elems[elem_ind].show = false;
		var elem = this.elems[elem_ind];
		if (0 < elem.containers.length) {
			for (var i = 0; i < elem.containers.length; ++i) {
				var name = elem.containers[i];
				if (!containers[name]) {
					this.task.error("the inserted container \""+name+"\" is "+containers[name]);
					return;
				}
				containers[name].parent_ready_bool = false;
				this.task.debug("container \""+name+"\" parent ready ="+containers[name].parent_ready_bool);
			}
		}
		this.shown[elem_ind] = false;
		this.task.debug(this.elems[elem_ind].global_id+" is shown ="+this.shown[elem_ind]);

		dom_update.call(this, elem_ind, glob.document.createElement("div"));
	}
	/*
	 * purpose: to create dom-element from element and exchange it in container with old one
	 * context: Container
	 */
	function change(el_ind) {
		var func = "change(): ";
		var tmp_node;
		if ("table" === this.type) {
			tmp_node = glob.document.createElement("table");
		} else {
			tmp_node = glob.document.createElement("div");
		}
		tmp_node.innerHTML = this.elems[el_ind].html.join("").replace(/[\n\t]/g, "");
		if (!tmp_node.firstChild || (tmp_node.firstChild.nodeType !== Node.ELEMENT_NODE)) {
			this.task.error("unable to create new element: not valid string ="+this.elems[el_ind].html.join("").replace(/[\n\t]/g, ""));
			return;
		}
		tmp_node.firstChild.setAttribute("yaf_id", this.elems[el_ind].global_id);
		this.task.debug(func+"new element to exchange at["+el_ind+"] ready");
		dom_update.call(this, el_ind, tmp_node.firstChild);
	}
	/*
	 * purpose: to update element at browser dom
	 * context: Container
	 */
	function dom_update(el_ind, new_el) {
		var func = "dom_update(): ";
		var parent_element = glob.document.querySelector(this.head);
		if (!parent_element) {
			this.task.error(func+"container parent is not in dom: "+this.head+">"); 
			return;
		}
		var childrens = parent_element.children.length;
		/* this is a key logic for all containers except 'single'
		 * index to be processed is allowed to be equal or +1 from last child index
		 * in case the index is 1 more only append is allowed - TODO
		 */
		if (("single" !== this.type) && (el_ind > childrens)) {
			this.task.error(func+"element index is to high ="+el_ind+": there is no child to update, childrens ="+childrens);
			return;
		}
		// TODO single is another
		if ("single" === this.type) {
			el_ind = 0;
		}
		if ("table" === this.type) {
			++el_ind;
		}
		if (el_ind === childrens) {
			parent_element.appendChild(new_el);
			this.task.result = func+" new element appended at "+el_ind;
		} else {
			parent_element.replaceChild(new_el, parent_element.children[el_ind]);
			this.task.result = func+" new element replaced at "+el_ind;
		}
	}
	/*
	 * purpose: to be called once container is in DOM to start element add
	 */
	function add_to_parent(bool) {
		var func = "parent_ready(): ";
		if (this.parent_ready_bool) {
			this.task.error(func+"is called twice");
			return;
		}
		this.parent_ready_bool = bool;
		if (!this.parent_ready_bool) {
			this.task.error(func+"is called with false argument");
			return;
		}
		this.task.debug("loaded ="+JSON.stringify(this.loaded));
		var parent_element = glob.document.querySelector(this.head);
		if (!parent_element) {
			this.task.error(func+"parent is not in dom: "+this.head+">"); 
			return;
		}
		// TODO single is another
		create_children.call(this, parent_element);
	}
	/*
	 * purpose: to create children from allready loaded or empty to be updated later
	 * context: Container
	 */
	function create_children(parent_element) {
		var func = "create_children(): ";
		// get the number of elements to be created
		var child_elems = (this.elem_names.length > this.loaded.length) ? this.elem_names.length : this.loaded.length;
		if ("single" === this.type) {
			child_elems = 1;
		}
		// create empty elements to be changed on update
		for (var i = 0; i < child_elems; ++i) {
			if (this.loaded[i]) {
				show.call(this, i);
			} else {
				if ("table" === this.type) {
					parent_element.appendChild(glob.document.createElement("tr"));
				} else {
					parent_element.appendChild(glob.document.createElement("div"));
				}
			}
		}
		this.task.result = this.name+": children.length = "+parent_element.children.length;
/*
		if (child_elems !== prnt.children.length) {
			this.task.error(func+" [FAIL]: unable to create "+child_elems+" child elements");
		}
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
	function test() {
		var success = 255;
		return success;
	}
})(window);
