;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"ui_element",
		["log", "net"],
		UI_element,
		test
	];
	// create app resources
	var ui_path = "ui/";
	var ui_ext = ".html";

	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("element");
	core.core_loader.module = module_data;

	/*
	* purpose: provides interfaces(tasks) common for all ui elements
	*/
	function UI_element() {
		this.name = "ui_element";
		this.global_id = "ui_element>model"

		this.create = core.task.create(["create", create_element]);
	}
	/*
	* purpose: to create new ui element instance
	*/
	function create_element([model_data, name, config_string]) 
	{
		var func = "create_element(): ";
		// error exit
		if (this.task.string_is_not_valid(func, "model_data", model_data)) return;
		if (this.task.string_is_not_valid(func, "name", name)) return;
		if (this.task.string_is_not_valid(func, "config_string", config_string)) return;

		var new_element = new Element(model_data, name);

		// initialize element from string
		this.task.run_sync("object", new_element, "parse_config_string", config_string);

		// inform appropriate model that element is ready to insert model data
		this.task.run_async("model", new_element.model.name, "ui_ready", new_element);
	}
	/*
	 * purpose: to create new Element
	 * arguments: string, string
	 */
	function Element(model_data, name)
	{
		log.info = "Element(): new, data = "+JSON.stringify(arguments)+";";

		this.name = model_data.split(">").join("")+"_"+name;	// unique name
		this.model = new Model(model_data);
		// TODO possible dupliation with name
		this.global_id = "Element>"+this.name;
		this.log = new core.log.Model(["element", this.name]);

		this.parnt = "";
		this.roles = [];

		this.html = [];
		this.attrs = {};
		this.actions = {};

		this.containers = [];

		this.ui_path = ui_path+this.model.name+"/"+this.name+ui_ext;

		this.parse_config_string = core.task.create(["parse_config_string", parse_config_string]);
		this.update = core.task.create(["update", update_element]);
		this.update_html = core.task.create(["update_html", update_html]);

		this.show = true;
		// TODO
		Object.defineProperty(this, "action", {
			set: function(d) { 
				(undefined === this.actions[d[0]])
					? this.log.error = "Element(): {actions}: attempt to update undefined action ="+JSON.stringify(d)
					: this.actions[d[0]].update(d);
			},
			get: function() {return true; }
		});
		Object.defineProperty(this, "attr", {
			set: function(d) { 
				(undefined === this.attrs[d[0]])
					? this.log.error = "Element(): {actions}: attempt to update undefined action ="+JSON.stringify(d)
					: this.attrs[d[0]].update(d);
			},
			get: function() {return true; }
		});
	}
	/*
	 * purpose: to update element on data change
	 * context: Element
	 */
	function update_element()
	{
		var func = "update_element(): ";
		if (element_not_valid(func, this)) return;
		//this.task.run_sync("object", this, "update_html");
		update_html.call(this);
		// rename 'parnt' to more meaningful variable name
		var cont_name = this.parnt;
		this.task.run_async("core", "ui_container", "update_container", [cont_name, this]);
		this.task.result = func+"html updated";
	}
	/*
	 * purpose: to validate element
	 * context: no
	 */
	function element_not_valid(func, elem) {
		if (!elem || !elem.parnt) {
			this.task.error(func+"element is not valid;");
			return true;
		}
		return false;
	}
	function Attribute(attr_data_arr) {
		log.info = "Attribute(): new ="+JSON.stringify(attr_data_arr)+";";

		this.name = attr_data_arr[0];
		this.data = attr_data_arr[1];
		this.ind = attr_data_arr[2];
		
		this.update = function(data_arr) {
			log.info = "Attribute(): \""+this.name+"\" update(): data_arr ="+JSON.stringify(data_arr);
			this.data = data_arr[1];
		}
	}
	function Action(action_data_arr) {
		log.info = "Action(): new ="+JSON.stringify(action_data_arr)+";";

		this.name = action_data_arr[0];
		this.data = action_data_arr[1];
		this.ind = action_data_arr[2];
		
		this.update = function(data_arr) {
			log.info = "Action(): \""+this.name+"\" update(): data_arr ="+JSON.stringify(data_arr);
			this.data = data_arr[1];
		}
	}
	function Model(model_data) {
		log.info = "Model(): new ="+JSON.stringify(model_data)+";";
		if ((undefined === model_data) || (typeof model_data !== "string")) {
			log.error = "Model(): <model_data> is not valid: "+model_data;
			return;
		}
		var data_array = model_data.split(">");
		this.name = data_array[0];
		this.id = (2 === data_array.length) ? data_array[1] : "model";
	}
	function parse_config_string(data) {
		var func = "parse_config_string(): ";
		if (this.task.string_is_not_valid(func, "config_string", data)) return;

		var arr = data.split("|");
		// parse data to create template
		if (!this || !(this instanceof Element)) {
			this.task.error(func+"context is not valid ="+this+";");
			return;
		}
		if (3 > arr.length) {
			this.task.error(func+"data arr.length is not valid(less than 3) ="+arr.length+";");
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
/*
					if (!this.attrs[attr]) {
						this.attrs[attr] = {};
						this.attrs[attr].data = null;
					}
					this.attrs[attr].ind = i;
*/
					this.attrs[attr] = new Attribute([attr, null, i]);
					this.html.push(null);
					break;
				case "#":	// action
					var action_name = arr[i].slice(1);
					this.actions[action_name] = new Action([action_name, null, i]);
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
						this.task.error(func+"wrong container data provided ="+data_arr[0]);
						break;
					}
					var name = cont_data[0];
					var type = cont_data[1];

					if (this.containers[name]) {
						this.task.error(func+"double container \""+name+"\" initialization");
						break;
					}
					this.containers.push(name);
					this.task.run_async("core", "ui_container", "create", [name, type, children]);
					this.html.push(null);
					break;
				default:
					this.html.push(arr[i]);
			}
		}
		//this.task.debug(func+"html: "+this.html+", attrs: "+this.attrs+", actions: "+JSON.stringify(this.actions));
	}
	/*
	 * purpose: to create html valid string from ui_element
	 * context: Element
	 */
	function update_html() {
		var func = "html_from_ui_element(): ";
		if (this.attrs) {
			var attr_names = Object.keys(this.attrs);
			for (var i = 0; i < attr_names.length; ++i) {
				var attr = this.attrs[attr_names[i]];
				if (attr.data) {
					this.html[attr.ind] = attr.data;
				}
			}
		}
		if (this.actions) {
			var action_names = Object.keys(this.actions);
			for (var i = 0; i < action_names.length; ++i) {
				var new_action = this.actions[action_names[i]];
				if (new_action.data) {
					this.html[new_action.ind] = new_action.data;
				}
			};
		}
		var result = this.html.join("");
		this.task.debug(func+" RESULT: "+result);
	}
	function test() {
		var success = 255;
		return success;
	}
})(window);
