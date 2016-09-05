;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;	

	// init static data
	var module_data = [
		"app",
		["log", "ui", "user", "net"],
		App_model,
		test
	];
    var model_ui = {
        guest: {
            ui: ["guest_body", "header", "main", "footer"],
            actions: {
                login: ["login", "app.core.user.login([u_name.value, u_pass.value]);return false"]
            },
            models: ["user"]
        },
        manager: {
            ui: ["header", "main", "footer", "menu"],
            actions: {
                menu: ["logout", "app.core.user.logout()"]
            },
            models: ["user", "project"]
        },
        admin: {
            ui: ["admin_body", "dash_main", "menu", "dash_header"],
            actions: {
                menu: ["logout", "app.core.user.logout()"]
            },
            models: ["user", "project", "app"]
        }
    };

	//var users_data = {};
	var instance_ui_data = {};

	var core = glob.app.core;
	// load module
	var message = ["app_model"];
	var log = new core.Logger("model-app");
	core.data_loader.module = module_data;

	function App_model() {
		core.model.Model.call(this);

		log = new core.log.Model(["app", "model"]);
		log.info = "App_model(): new model create";
		this.log = log;

		this.name = "app";
		this.message = message.concat([""]);

		this.get_config_data = get_config_data;

	}
	App_model.prototype = Object.create(core.model.Model.prototype);
	App_model.prototype.constructor = App_model;

	function get_config_data(user) {
		var data = model_ui[user.role_name];
		return data;
	}

	function test() {
		return 255;
	}
})(window);
