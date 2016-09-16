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
		this.add_element = core.task.create(["add_element", add_element]);
		this.create = core.task.create(["create", create_container]);
		this.clean_up = core.task.create(["clean_up", clean_up]);
		// service
		this.get = function() { return JSON.stringify(containers);};
	}
	function clean_up() {
		containers = {};
	}
	function add_element([cont_name, elem]) {
		// if container is not loaded yet, put element to queue
		if (!containers[cont_name]) {
			if (undefined === el_queue[cont_name]) {
				this.task.debug(func+"new el_queue ="+cont_name);
				el_queue[cont_name] = [];
			}
			this.task.debug(func+"element \""+elem.name+"\" in el_queue ="+cont_name);
			el_queue[cont_name].push(elem);
			this.task.result = elem.global_id+" in el_queue";
		} else {
			this.task.run_sync("object", containers[cont_name], "insert", elem);
		}
		//this.task.error("not implemented yet");
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
				this.task.run_sync("object", containers[name], "insert", el_queue[name].shift());
			}
		}
	}
	function Container(name, type, elems) {
		this.name = name;
		this.global_id = "container>"+name;
		var func = "Container(): ";

		this.type = type;
		switch (this.type) {
			case "single":
				this.insert = core.task.create(["insert", change_element]);
				this.change = core.task.create(["change", replace_inner_html]);
				this.update = core.task.create(["update", replace_inner_html]);
				break;
			case "named":
				this.insert = core.task.create(["insert", insert_element]);
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
		this.remove = core.task.create(["remove", remove]);
	}
	/*
	 * purpose: to remove container: move all ready to queue
	 */
	function remove() {
		// clean up
		for (var i = 0; i < this.elems.length; ++i) {
			if (undefined !== this.ready[i] || null !== this.ready[i]) {
				this.queue[i] = this.ready[i];
				this.ready[i] = null;
			}
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
		if (this.queue[0]) {
			this.task.run_async("object", this, "insert", this.queue[0]);
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
