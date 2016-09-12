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
	var message = ["element"];
	core.core_loader.module = module_data;

	// module constructor
	function UI_element() {
		this.name = "ui_element";
		this.global_id = "ui_element>model"
/*
		this.Element = Element;
*/
		this.create = core.task.create(["create", create_element]);
	}
	function create_element(data) {
		new Element(data);
	}
	function Element(model_data, name, config_string) {
		log.info = "Element(): new "+model_data+": "+name+" = "+config_string;

		this.name = model_data.split(">").join("")+"_"+name;
		this.model = new Model(model_data);
		//this.log = new core.Logger(name);
		this.log = new core.log.Model(["element", this.name]);

		this.message = message.concat(["Element:"+name]);
		var ready = false;
		this.parnt = "";
		this.roles = [];

		this.html = [];
		this.attrs = {};
		this.action = {};

		this.containers = [];

		this.ui_path = ui_path+this.model.name+"/"+this.name+ui_ext;

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

		if (config_string) {
			element_from_string.bind(this)(config_string);
		} else {
			core.message = this.message.concat(["net", "req_get", [this.ui_path, element_from_string.bind(this)]]);
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
		if ((undefined === model_data) || (typeof model_data !== "string")) {
			log.error = "Model(): <model_data> is not valid: "+model_data;
			return;
		}
		var data_array = model_data.split(">");
		this.name = data_array[0];
		this.id = (2 === data_array.length) ? data_array[1] : "model";
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
					this.action[action_name] = new Action([action_name, null, i]);
					this.html.push(null);
					break;
				case "$": 	// container
					// split container and children
					//console.log("container parser: ["+arr[i].toString()+"];");
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
					//this.containers.push(new core.ui.Container(name, type, children));
					this.containers.push(name);
					core.message = this.message.concat(["ui", "container", [name, type, children]]);
					this.html.push(null);
					break;
				default:
					this.html.push(arr[i]);
			}
		}
		this.log.info = func+"html: "+this.html+", attrs: "+this.attrs+", actions: "+JSON.stringify(this.action);
		core.model_data = this.message.concat([this.model.name, "ui_ready", this]);
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
