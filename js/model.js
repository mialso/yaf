;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"model",	// name
		["log", "task"],		// dependencies
		Model_init,		// constructor
		test		// test function
	];

	var core = glob.app.core;
	var log = new core.Logger("core-model");
	core.core_loader.module = module_data;
	function Model_init() {
		this.Model = Model;
	}
	/*
	 * purpose: to provide common for all data models interfaces and services
	 * context: new object with id and name fields already set
	 */
	function Model() {
		var func = "Model(): ";
		if (!this.name || typeof this.name !== "string") {
			log.error = func+ "wrong \"name\" data provided: this.name ="+this.name+";"; 	// task error
			return;
		}
		if (!this.id || typeof this.id !== 'string') {
			log.error = func+ "wrong \"id\" data provided: this.id ="+this.id+";"; 	// task error
			return;
		}

		this.log = new core.log.Model([this.name, this.id]);	// sub task ???
		this.global_id = this.name+">"+this.id;

		this.ui = {};
		this.ui_config;
		this.actions;
		this.attrs = {};

		// common for all models interface
		this.set_ui = core.task.create(["set_ui", set_ui]);

		// only model model interface
		if ("model" === this.id) {
			this.instances = {};
			this.instances_data = [];
			this.instance_config = null;

			this.clean_up = core.task.create(["clean_up", clean_up]);
			this.init = core.task.create(["init", init_model]);
			this.ui_ready = core.task.create(["ui_ready", set_model_ui]);

			this.add_instance = core.task.create(["add_instance", add_instance]);
			this.add_instance_config = core.task.create(["add_instance_config", add_instance_config]);
		}

		// to be implemented in real model
		/*
		 * purpose: to get instances data
		 */
		this.get_model_data = function() {}
		/*
		 * purpose: to get instances config data to create new models
		 */
		this.get_model_config_data = function() {}
		/*
		 * purpose: get config data to create model
		 */
		this.get_config_data = function() {
			return {};
		}
		this.Instance = function(data) {
			this.name = "default model";
		}
	}
	function clean_up() {
		this.instances = {};
		this.instances_data = [];
		this.ui = {};
	}

	function init_model(user) {
		var func = "init_model(): ";
		//this.log.info = func+"user \""+user.name+"\" data initializion ="+JSON.stringify(user)+";";
		this.task.debug(func+"user \""+user.name+"\" data initializion ="+JSON.stringify(user)+";");
		
		// init model static data

		// init model ui
		var config = this.get_config_data(user);
		this.actions = config.actions;
		this.ui_config = config.ui;

		// get projects data and init models
		this.get_model_data(user);
		this.get_model_config_data(user);

		if (this.ui_config) {
			this.task.run_async("core", "ui", "model", [this.name, this.ui_config]);
		}
	}
	/*
	 * purpose: to add instance config and check if any instances data is ready
	 * + to be initialized. Run add_instance in case of instance data present.
	 */
	function add_instance_config(data) {
		var func = "add_instance_config(): ";
		// TODO validate 
		this.instance_config = data;
		if (0 === this.instances_data.length) {
			return;
		}
		for (var i = 0; i < this.instances_data.length; ++i) {
			this.task.run_async("object", this, "add_instance", this.instances_data[i]);
		}
	}
	/*
	 * purpose: to add instance
	 * context: instance Model
	 */
	function add_instance(model_data) {
		var func = "add_instance(): ";
		if (!this.instance_config) {
			this.instances_data.push(model_data);
			// TODO this is task result
			this.task.debug(func+"new model data pushed to instances_data");
			return;
		}
		this.instances[model_data[0]] = new this.Instance(model_data, this.instance_config);
		this.task.run_async("core", "ui", "model", [this.instances[model_data[0]].global_id, this.instances[model_data[0]].ui_config]);
	}
	/*
	 * purpose: to add new element to model instance
	 */
	function set_model_ui(element) {
		var func = "set_model_ui(): ";
		if (!element) {
			this.task.error(func+"element <"+element+"> is not valid;");
			return;
		}
		if ("model" === element.model.id) {		
			this.task.run_async("object", this, "set_ui", element);
		} else {
			// set ui data 
			if (!this.instances[element.model.id]) {
				this.task.error(func+"no instance \""+element.model.id+"\" for element ="+JSON.stringify(element)+";");
				return;
			}
			this.task.run_async("object", this.instances[element.model.id], "set_ui", element);
		}
	}
	/*
	 * purpose: to set ui element with actions and attributes
	 * context: Model
	 */
	function set_ui(el) {
		var func = "set_ui(): ";
		// TODO update element naming
		var name = el.name.split("_").slice(1).join("_");
		this.ui[name] = el;
		var incode_id = "var id='"+this.id+"';";
		// update actions
		if (this.actions[name] && (0 < this.actions[name].length)) {
			for (var i = 0; i < this.actions[name].length; ++i) {
				var new_action = this.actions[name][i].slice();
				new_action[1] = incode_id+new_action[1];
				this.ui[name].action = new_action;
				this.task.debug(func+"ui["+name+"] action <"+new_action+"> created");
			}
		}
		// update attributes
		var attr_names = Object.keys(this.ui[name].attrs);
		for (var i = 0; i < attr_names.length; ++i) {
			var attr_name = attr_names[i];
			this.ui[name].attr = [attr_name, this.attrs[attr_name]];	
		}
		
		this.task.run_async("object", this.ui[name], "update");
	}

	function test() {
		return 255;
	}
	
})(window);
