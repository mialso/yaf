;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;	

	// init static data
	var module_data = [
		"project",
		["ui", "user", "net"],
		Project_model,
		test
	];
	var projects_data = {
		vasil: [
			["0001", "project_1"],
			["0002", "project_2"],
			["0003", "project_X"]
		]
	};
	var model_ui = {
		guest: {},
		manager: {},
		admin: {
			ui: ["project_menu_entry"],
			actions: {
				project_menu_entry: ["show", "app.project.show();"]
			}
		}
	};
	var instance_ui = {
		ui: [],
		actions: {}
	};
	var core = glob.app.core;
	// load module
	var log = new core.Logger("model-project");
	core.data_loader.module = module_data;

	function Project_model() {
		log.info = "Project_model(): new model create";
		this.log = log;

		this.instance = {};
		this.ui_config;
		this.actions;
		this.ui = {};
		this.set_ui = set_ui;

		this.message = ["project_model", ""];

		this.show = function() {
			console.log("Projects show");
			glob.document.querySelector(".dash_header").innerHTML = "Projects";
		}

		Object.defineProperty(this, "user", {
			set: init_model.bind(this),
			get: function() { return true; }
		});
		Object.defineProperty(this, "ui_ready", {
			set: set_model_ui.bind(this),
			get: function() { return true; }
		});
	}
	function set_model_ui(data) {
		var func = "set_model_ui(): ";
		this.log.info = func+" project ="+data.model.id+", data = "+JSON.stringify(data);
		if (undefined !== data.model.id && null !== data.model.id) {		
			this.instance[data.model.id].set_ui(data);
		} else {
			// set ui data 
			this.set_ui(data);
		}
	}
	function init_model(user) {
		var func = "init_model(): ";
		this.log.info = func+"user \""+user.name+"\" data initializion";
		
		// init model static data


		// get projects data and init models
		if (undefined === projects_data[user.name]) {
			this.log.info = func+"user \""+user.name+"\" has no projects";
			return;
		} else {
			var slf = this;
			projects_data[user.name].forEach(function(data) {
				//this.instances.push(new Project(data));
				slf.instance[data[0]] = new Project(data);
			});
		}
		// init model ui
		this.actions = model_ui[user.role_name].actions;
		this.ui_config = model_ui[user.role_name].ui;
		core.message = this.message.concat(["ui", "model", ["project", this.ui_config]]);
	}
				
	function Project(data) {
		log.info = "Project(): new project ="+JSON.stringify(data);
		this.id = data[0];
		this.log = new core.Logger("project-"+this.id);
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
