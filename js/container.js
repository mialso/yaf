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
	function clean_up() {
		containers = {};
	}
	function update_container([cont_name, elem]) {
		// if container is not loaded yet, put element to queue
		if (!containers[cont_name]) {
			// create queue if absent
			if (undefined === el_queue[cont_name]) {
				this.task.debug(func+"new el_queue ="+cont_name);
				el_queue[cont_name] = [];
			}
			this.task.debug(func+"element \""+elem.name+"\" in el_queue ="+cont_name);
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
				this.task.debug(func+"element \""+el_queue[new_cont][0].name+" inserted to container \""+new_cont+"\"");
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
			//return elem.model.name+elem.model.id;
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
			case "named":
				this.get_elem_id = function(elem) {
					return elem.name;
				}
				this.get_elem_index = function(el_id) {
					return this.elem_names.indexOf(el_id);
				};
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
		this.prnt = name.split("_").slice(0,-1).join("_");

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
		//this.elems[elem_ind] = elem.html.join("").replace(/[\n\t]/g, "");
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
		//this.change(el_id, elem_ind);
		if (elem.show) {
			show.call(this, elem_ind);
			this.task.result = this.loaded[elem_ind]+" is shown";
		} else {
			hide.call(this, elem_ind);
			this.task.result = this.loaded[elem_ind]+" is hidden";
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
		change.call(this, elem_ind);
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
		this.shown[elem_ind] = true;
	}
	/*
	 * purpose: to hide element
	 * context: Container
	 */
	function hide(elem_ind) {
		this.elems[elem_ind].show = false;
		dom_update.call(this, elem_ind, glob.document.createElement("div"));
		var elem = this.elems[elem_ind];
		if (0 < elem.containers.length) {
			for (var i = 0; i < elem.containers.length; ++i) {
				var name = elem.containers[i];
				if (!containers[name]) {
					this.task.error("the inserted container \""+name+"\" is "+containers[name]);
					return;
				}
				containers[name].parent_ready_bool = false;
				this.task.debug("container \""+name+"\" parent ready [false]");
			}
		}
		this.shown[elem_ind] = undefined;
		this.task.debug(elem.name+"is hidden");
	}
	/*
	 * purpose: to change element in container
	 * context: Container
	 */
	function change(el_ind, show) {
		var func = "insert(): ";
		var tmp_node = glob.document.createElement("div");
		//tmp_node.innerHTML = (show) ? this.elems[el_ind] : '<div style="visibility:hidden;"></div>';
		tmp_node.innerHTML = this.elems[el_ind].html.join("").replace(/[\n\t]/g, "");
		if (!tmp_node.firstChild || (tmp_node.firstChild.nodeType !== Node.ELEMENT_NODE)) {
			this.task.error("unable to create new element: not valid string ="+this.elems[el_ind]);
			return;
		}
		dom_update.call(this, el_ind, tmp_node.firstChild);
		this.task.result = this.name+": child["+el_ind+"]: updated";
	}
	/*
	 * purpose: to update element at browser dom
	 * context: Container
	 */
	function dom_update(el_ind, new_el) {
		var func = "dom_update(): ";
		var prnt = glob.document.querySelector(this.head);
		if (!prnt) {
			this.task.error(func+"container parent is not in dom: "+this.head+">"); 
			return;
		}
		var childrens = prnt.children.length;
		if (("single" !== this.type) && (el_ind > childrens)) {
			this.task.error(func+"element index is to high ="+el_ind+": there is no child to update, childrens ="+childrens);
			return;
		}
		// TODO single is another
		if ("single" === this.type) {
			el_ind = 0;
		}
		if (el_ind === childrens) {
			prnt.appendChild(new_el);
			this.task.debug(func+" new appended at "+el_ind);
		} else {
			prnt.replaceChild(new_el, prnt.children[el_ind]);
			this.task.debug(func+" new replaced at "+el_ind);
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
		var prnt = glob.document.querySelector(this.head);
		if (!prnt) {
			this.task.error(func+"parent is not in dom: "+this.head+">"); 
			return;
		}
		// TODO single is another
		//this.create_children();
		create_children.call(this, prnt);
	}
	/*
	 * purpose: to create children from allready loaded or empty to be updated later
	 * context: Container
	 */
	function create_children(prnt) {
		var func = "create_children(): ";
		// get the number of elements to be created
		var child_elems = (this.elem_names.length > this.loaded.length) ? this.elem_names.length : this.loaded.length;
		if ("single" === this.type) {
			child_elems = 1;
		}
		// create empty elements to be changed on update
		for (var i = 0; i < child_elems; ++i) {
/*
			var el = glob.document.createElement("div");
			if (this.loaded[i]) {
				var tmp_el = el;
				tmp_el.innerHTML = this.elems[i];
				el = tmp_el.firstChild;
			}
			prnt.appendChild(el);
*/
			if (this.loaded[i]) {
				show.call(this, i);
			} else {
				prnt.appendChild(glob.document.createElement("div"));
			}
		}
		this.task.result = this.name+": children.length = "+prnt.children.length;
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
