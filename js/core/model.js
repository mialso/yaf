;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"model",	// name
		["log", "ui", "task"],		// dependencies
		Model_init,		// constructor
		test		// test function
	];

	var core = glob.app.core;
	var log = new core.Logger("core-model");
	core.core_loader.module = module_data;
	function Model_init() {
		this.Model = Model;
	}

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
		this.message = ["default model"];

		// common for all models interface
		this.set_ui = core.task.create(["set_ui", set_ui]);

		// only model model interface
		if ("model" === this.id) {
			this.instances = {};
			this.clean_up = core.task.create(["clean_up", clean_up]);
			this.init = core.task.create(["init", init_model]);
			this.ui_ready = core.task.create(["ui_ready", set_model_ui]);
		}

		// to be implemented in real model
		this.get_model_data = function() {
			return [];
		}
		this.get_model_config_data = function() {
			return {};
		}
		this.get_config_data = function() {
			return {};
		}
		this.Instance = function(data) {
			this.name = "default model";
		}
	}
	function clean_up() {
		this.instances = {};
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
		var model_data = this.get_model_data(user);
		var model_config = this.get_model_config_data(user);
		for (var i = 0; i < model_data.length; ++i) {
			this.instances[model_data[i][0]] = new this.Instance(model_data[i], model_config);
			this.task.run_async("core", "ui", "model", [this.instances[model_data[i][0]].global_id, this.instances[model_data[i][0]].ui_config]);
		}
			
		if (this.ui_config) {
			this.task.run_async("core", "ui", "model", [this.name, this.ui_config]);
		}
	}

	/*
	 * purpose: to add new element to model instance
	 */
	function set_model_ui(element) {
		var func = "set_model_ui(): ";
		if (!element) {
			this.task.debug(func+"element <"+element+"> is not valid;");
		}
		//if (undefined !== element.model.id && null !== element.model.id) {		
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
		// update actions
		if (this.actions[name]) {
			this.task.debug(func+"ui["+name+"] action <"+this.actions[name]+"> created");
			this.ui[name].actions = this.actions[name];
		}
		
		this.task.run_async("object", this.ui[name], "update");
	}

	function test() {
		return 255;
	}
	
})(window);
