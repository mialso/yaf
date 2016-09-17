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
		this.update_container = core.task.create(["update_container", update_container]);
		this.create = core.task.create(["create", create_container]);
		this.clean_up = core.task.create(["clean_up", clean_up]);
		// service
		this.get = function() { return JSON.stringify(containers);};
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
			return elem.model.name+elem.model.id;
		};
		this.get_elem_index = function(el_id) {
			return elem_names.indexOf(el_id);
		};
		this.add_element = function(el_id) {
			return elem_names.push(el_id)-1;
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
					return elem_names.indexOf(el_id);
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

		this.parent_ready_bool = false;
	}
	/*
	* purpose: to update element within container
	* context: Container
	*/
	function update_element(elem) {
		func = "update_element(): ";
		if (elem_is_not_valid.call(this, elem)) return;
		var el_id = this.get_elem_id(elem);
		var elem_ind = this.get_elem_index(el_id);
		// add element id to container elems
		if (-1 === elem_ind) {
			elem_ind = this.add_element(el_id);
		}
		if (-1 === elem_ind) {
			this.task.error(func+"unable to add element to container");
			return;
		} else {
			this.task.debug(func+"element added successfully");
		}
		// update element data
		this.elems[new_ind] = elem.html.join("");
		this.task.debug(func+"\""+el_id+"["+new_ind+"]\" updated");
		// mark loaded elements
		this.task.debug(func+"\""+elem.name+"\" is loaded, ind ="+elem_ind);
		this.loaded[elem_ind] = this.elem_names[elem_ind];
		// check if container is in dom already and is able to insert elements
		if (!this.parent_ready_bool) {
			this.task.result = this.loaded[elem_ind]+"is loaded to \""+this.global_id+"\"";
			return;
		}
		this.change(el_id, elem_ind);
	}
	/*
	 * purpose: to insert element to container
	 */
	function change(el_id, el_ind) {
		var func = "insert(): ";
		var prnt = glob.document.querySelector(this.head);
		if (!prnt) {
			this.task.error(func+"container parent is not in dom: "+this.head+">"); 
			return;
		}
		var children = prnt.children;
		if (el_ind > children.length) {
			this.task.error(func+"element index is to high: there is no child to update");
			return;
		}
		var tmp_node = glob.document.createElement("div");
		tmp_node.innerHTML = this.elems[el_ind];
		// TODO single is another
		if (el_ind === children.length) {
			prnt.appendChild(tmp_node.firstChild);
		} else {
			prnt.replaceChild(tmp_node.firstChild, prnt.children[el_ind]);
		}
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
		this.task.debug("queue ="+JSON.stringify(this.queue));
		var prnt = glob.document.querySelector(this.head);
		if (!prnt) {
			this.task.error(func+"parent is not in dom: "+this.head+">"); 
			return;
		}
		// TODO single is another
		this.create_children();
	}
	/*
	 * purpose: to create children from allready loaded or empty to be updated later
	 * context: Container
	 */
	function create_children(loaded) {
		// get the number of elements to be created
		var child_elems = (this.elem_names.length > this.loaded.length) ? this.elem_names.length : this.loaded.length;
		// create empty elements to be changed on update
		for (var i = 0; i < this.child_elems; ++i) {
			var el = glob.document.createElement("div");
			if (this.queue[i]) {
				var tmp_el = el;
				tmp_el.innerHTML = this.elems[i];
				el = tmp_el.firstChild;
			}
			prnt.appendChild(el);
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
			this.task.result = elem.name+"is in container queue";
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
			//this.task.error(func+"parent is not ready");
			this.task.result = "element \""+elem.name+"\" queued: parent is not ready";
			return;
		}

		// change element functionality
		// check if default was already in dom(first time init)
		if (undefined === this.ready[0] || null === this.ready[0]) {
			if (undefined !== this.queue[0]) {
				replace_inner_html.call(this, [0, this.queue[0]]);
				this.task.result = "element \""+elem.name+"\" inserted: default";
			}
		}
	}
	/*
	 * purpose: to change dom element inner HTML
	 */
	function replace_inner_html([ind, elem]) {
		var func = "replace_inner_html(): ";
		if (null === ind || !elem) {
			this.task.error(func+"arguments validation failed;");
			return;
		}
		if (!glob.document.querySelector(this.head)) {
			this.task.error(func+"container parent is not in dom: "+this.head+">"); 
			return;
		}
		glob.document.querySelector(this.head).innerHTML = elem.html.join("");
		this.ready[ind] = elem;
		//this.queue[ind] = null;

		this.task.run_async("core", "ui", "in_dom", elem);
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
	function insert_element(elem) {
		var func = "insert_element(): ";
		if (elem_is_not_valid.call(this, elem)) return;

		// named container
		if (0 === this.elems.length) {
			this.task.error(func+"no elements names in elems;");
			return;
		}
		// TODO update element naming
		var ind = this.elems.indexOf(elem.name);
		if (-1 === ind) {
			this.task.error(func+"elem.name \""+elem.name+"\" not found in elems =["+this.elems+"]"); 
			return;
		}
		this.task.debug("elem.name ="+elem.name+", ind ="+ind+";");
		// common part
		if (!this.parent_ready_bool) {
			this.queue[ind] = elem;
			this.task.result = "element \""+elem.global_id+"\" queued: container not ready;";
			return;
		}
		// named container
		if (this.ready[ind-1] || (0 === ind)) {
			insert_next.call(this, ind, elem);
		} else {
			this.queue[ind] = elem;
			this.task.result = "element \""+elem.global_id+"\" queued: previous not ready;";
		}
	}
	function insert_next(ind, elem) {
		var func = "insert_next(): ";
		if (!glob.document.querySelector(this.head)) {
			this.task.error(func+"container parent is not in dom: "+this.head+">"); 
			return;
		}
		var string = elem.html.join("");
		glob.document.querySelector(this.head).insertAdjacentHTML("beforeend", string);

		this.task.run_async("core", "ui", "in_dom", elem);

		this.ready[ind] = elem;
		this.queue[ind] = null;
		if (this.queue[ind+1]) {
			insert_next.call(this, ind+1, this.queue[ind+1]);
		}
		this.task.result = "element \""+elem.global_id+"\" dom added;";
	}
	function test() {
		var success = 255;
		return success;
	}
})(window);
