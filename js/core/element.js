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
	function Element(model_data, name) {
		log.info = "Element(): new, data = "+JSON.stringify(arguments)+";";

		this.name = model_data.split(">").join("")+"_"+name;	// unique name
		this.model = new Model(model_data);
		// TODO possible dupliation with name
		this.global_id = "Element>"+this.name;
		this.log = new core.log.Model(["element", this.name]);

		var ready = false;
		this.parnt = "";
		this.roles = [];

		this.html = [];
		this.attrs = {};
		this.action = {};

		this.containers = [];

		this.ui_path = ui_path+this.model.name+"/"+this.name+ui_ext;

		this.parse_config_string = core.task.create(["parse_config_string", parse_config_string]);

		// TODO
		Object.defineProperty(this, "actions", {
			set: function(d) { 
				console.log("XXXXXXXX actions: data="+JSON.stringify(d));
				(undefined === this.action[d[0]])
					? this.log.error = "Element(): {actions}: attempt to update undefined action ="+JSON.stringify(d)
					: this.action[d[0]].update(d);
			},
			get: function() {return true; }
		});
/*
		// TODO
		Object.defineProperty(this, "ready", {
			set: function(d) {
				console.log("XXXXXXXX ready: data="+JSON.stringify(d));
				ready = d; if (ready) { core.ui.ready = [model_data, name];}},
			get: function() { return ready;}
		});
*/
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
					if (!this.attrs[attr]) {
						this.attrs[attr] = {};
						this.attrs[attr].data = null;
					}
					this.attrs[attr].ind = i;
					this.html.push(null);
					break;
				case "#":	// action
					var action_name = arr[i].slice(1);
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
					this.task.run_async("core", "ui", "container", [name, type, children]);
					this.html.push(null);
					break;
				default:
					this.html.push(arr[i]);
			}
		}
		this.task.debug(func+"html: "+this.html+", attrs: "+this.attrs+", actions: "+JSON.stringify(this.action));
	}
	function test() {
		var success = 255;
/*
		success = test_model_from_string("test_ui", "<html><p>|@test_attr|</p></html>");
*/
		return success;
	}
/*
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
