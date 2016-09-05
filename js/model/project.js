;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;	

	// init static data
	var module_data = [
		"project",
		["ui", "user", "net", "log"],
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
			ui: ["project_menu_entry", "project_dash_main", "project_templates"],
			actions: {
				project_menu_entry: ["show", "app.project.show();"]
			}
		}
	};
	var instance_ui_data = {
		guest: {},
		manager: {},
		admin: {
			ui: ["project_instance_entry"],
			actions: {
				project_instance_entry: ["details", "app.project.details(this.name);"]
			}
		}
	};
	var core = glob.app.core;
	// load module
	var message = ["project_model"];
	//var log = new core.Logger("model-project");
	var log;
	core.data_loader.module = module_data;

	function Project_model() {
		core.model.Model.call(this);

		log = new core.log.Model(["project", "model"]);
		log.info = "Project_model(): new model create";
		this.log = log;

		this.name = "project";
		this.message = message.concat([""]);
		this.Instance = Project;

		this.get_config_data = get_config_data;
		this.get_model_config_data = get_model_config_data;
		this.get_model_data = get_model_data;

		this.show = function() {
			core.message = this.message.concat(["ui", "update", [this.ui["project_dash_main"].parnt, this.ui["project_dash_main"]]]);
		}
		this.details = function() {
			console.log("details not implemented yet");
		}

	}
	Project_model.prototype = Object.create(core.model.Model.prototype);
	Project_model.prototype.constructor = Project_model;

	function get_config_data(user) {
		return model_ui[user.role_name];
	}
	function get_model_config_data(user) {
		return instance_ui_data[user.role_name];
	}
	function get_model_data(user) {
		return projects_data[user.name];
	}
				
	function Project(data, config) {
		var func = "Project(): ";
		if (!Array.isArray(data) || (2 > data.length)) {
			log.error = func+" wrong data ="+JSON.stringify(data)+"; provided;";
			return;
		}
		log.info = "Project(): new project ="+JSON.stringify(data);

		core.model.Model.call(this);

		// project model related data
		this.id = data[0];
		this.name = data[1];

		// service data
		this.log = new core.log.Model(["project", this.id]);
		this.message = message.concat(["Project: "+this.id]);
		// TODO the question about user ????
		//this.get_config_data = get_config_data;
		this.actions = config.actions;
		this.ui_config = config.ui;

		core.message = this.message.concat(["ui", "model", ["project>"+this.id, this.ui_config]]);
	}
	Project.prototype = Object.create(core.model.Model.prototype);
	Project.prototype.constructor = Project;

	function test() {
		return 255;
	}
})(window);
