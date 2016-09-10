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
/*
		if (!this.log) {
			log.error = func+ "wrong \"log\" data provided: this.id ="+this.log+";"; 	// task error
			return;
		}
		if (!this.task) {
			log.error = func+ "wrong \"task\" data provided: this.id ="+this.log+";"; 	// task error
			return;
		}
*/

		this.log = new core.log.Model([this.name, this.id]);	// sub task ???
		this.task = new core.task.Task([this.name, this.id]);

		this.ui = {};
		this.ui_config;
		this.actions;
		this.message = ["default model"];

		// common for all models interface
		this.set_ui = set_ui;

		// only model model interface
		if ("model" === this.id) {
			this.instances = {};
			this.clean_up = clean_up;
			this.init = this.task.create(["init", init_model]);
			Object.defineProperty(this, "ui_ready", {
				set: set_model_ui.bind(this),
				get: function() { return true; }
			});
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
		this.log.info = func+"user \""+user.name+"\" data initializion ="+JSON.stringify(user)+";";
		
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
		}
			
		if (this.ui_config) {
			core.message = this.message.concat(["ui", "model", [this.name, this.ui_config]]);
		}
	}

	function set_model_ui(element) {
		var func = "set_model_ui(): ";
		this.log.info = func+"["+this.name+"]: <"+element.model.id+">, data = "+JSON.stringify(element);
		//if (undefined !== element.model.id && null !== element.model.id) {		
		if ("model" === element.model.id) {		
			this.set_ui(element);
		} else {
			// set ui data 
			if (!this.instances[element.model.id]) {
				this.log.error = func+"no instance \""+element.model.id+"\" for element ="+JSON.stringify(element)+";";
				return;
			}
			this.instances[element.model.id].set_ui(element);
		}
	}
	function set_ui(el) {
		var func = "set_ui(): ";
		this.log.info = func+"el ="+JSON.stringify(el);
		// TODO update element naming
		var name = el.name.split("_").slice(1).join("_");
		this.ui[name] = el;
		// update actions
		if (this.actions[name]) {
			this.log.info = func+"ui["+name+"] action <"+this.actions[name]+"> created";
			this.ui[name].actions = this.actions[name];
		}
		core.message = this.message.concat(["ui", "element", [this.ui[name].parnt, this.ui[name]]]);
	}

	function test() {
		return 255;
	}
	
})(window);
