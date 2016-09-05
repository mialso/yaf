;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"model",
		["log", "ui"],
		Model_init,
		test
	];

	var core = glob.app.core;
	var log = new core.Logger("core-model");
	core.core_loader.module = module_data;
	function Model_init() {
		this.Model = Model;
	}

	function Model() {
		this.name = "default model";
		this.instance = {};

		this.log;
		this.ui = {};
		this.ui_config;
		this.actions;
		this.message = ["default model"];

		this.set_ui = set_ui;

		Object.defineProperty(this, "user", {
			set: init_model.bind(this),
			get: function() { return true; }
		});
		Object.defineProperty(this, "ui_ready", {
			set: set_model_ui.bind(this),
			get: function() { return true; }
		});
		this.get_model_data = function() {
			// to be implemented in real model
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
			this.instance[model_data[i][0]] = new this.Instance(model_data[i], model_config);
		}
			
		if (!config.ui) {
			// no ui to initialize
			return;
		}
		core.message = this.message.concat(["ui", "model", [this.name, this.ui_config]]);
	}

	function set_model_ui(element) {
		var func = "set_model_ui(): ";
		this.log.info = func+"["+this.name+"]: <"+element.model.id+">, data = "+JSON.stringify(element);
		//if (undefined !== element.model.id && null !== element.model.id) {		
		if (element.model.id) {		
			this.instance[element.model.id].set_ui(element);
		} else {
			// set ui data 
			this.set_ui(element);
		}
	}
	function set_ui(el) {
		var func = "set_ui(): ";
		this.log.info = func+"el ="+JSON.stringify(el);
		var name = el.name;
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
