;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"user",
		["log", "ui", "task"],
		User,
		test
	];
	// create app resources
	var roles = {
		guest: {
			ui: ["guest_body", "header", "main", "footer", "login"],
			actions: {
				login: ["login", "app.core.user.login([u_name.value, u_pass.value]);return false"]
			},
			models: ["user", "app"]
		},
		manager: {
			ui: ["header", "main", "footer", "menu"],
			actions: {
				menu: ["logout", "app.core.user.logout()"]
			},
			models: ["app", "user", "project"]
		},
		admin: {
			ui: ["admin_body", "dash_main", "menu", "dash_header", "user_menu_entry", "user_dash_main"],
			actions: {
				menu: ["logout", "app.core.user.logout()"],
                user_menu_entry: ["show", "app.user.show();"]
			},
			models: ["user", "project", "app"]
		}
	};
	var users = {
		vasil: {
			name: "vasil",
			role: "admin",
			passw: "123"
		},
		std: {
			name: "guest",
			role: "guest",
			passw: ""
		}
	};
	var current_user = {
		name: users.std.name,
		role: roles[users.std.role],
		role_name: users.std.role
	};
	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("core-user");
	core.core_loader.module = module_data;

	// module constructor
	function User() {
		this.name = "user";
		this.id = "core";
		this.task = new core.task.Task([this.name, this.id]);
		this.login = this.task.create(["login", login]);
		this.logout = this.task.create(["logout", logout]);
	}
	function logout() {
		for (var i =0; i < current_user.role.models.length; ++i) {
			var model_name = current_user.role.models[i];
			if (undefined === glob.app[model_name]) {
				log.error = func+"module \""+model_name+"\" ="+glob.app[model_name]+" is not loaded;"; // task error
				return;
			}
			this.task.run_sync("model", model_name, "clean_up", null);
		}
		
		this.task.run_async("core", "user", "login", ["std", ""]);

		this.task.success();
	}
	function login(data) {
		var func = "login(): ";
		log.info = func+"data ="+JSON.stringify(data);
		if (!data || !Array.isArray(data) || 2 > data.length) {
			var data = ["std", ""];
		}

		get_user.bind(this)(data);
	}
	function get_user([name, passw]) {
		var func = "get_user(): ";
		//console.log(func + "task ="+JSON.stringify(this.task)+";");
		log.info = func+"name ="+name+" , pass ="+passw;
		var user_names = Object.keys(users);
		if (-1 === user_names.indexOf(name)) {
			log.error = func+"user \""+name+"\" does not exist";	// task error
			return;
		}
		var new_user = users[name];
		var role_names = Object.keys(roles);
		if (-1 === role_names.indexOf(new_user.role)) {
			log.error = func+"role \""+new_user.role+"\" does not exist"; 	// task error
			return;
		}
		// check passw
		if (passw !== new_user.passw) {
			log.error = func+"passw \""+passw+"\" is not correct"; 	// task error
			return;
		}
		// set user as current
		current_user.name = new_user.name;
		current_user.role = roles[new_user.role];
		current_user.role_name = new_user.role;

		this.task.run_sync("core", "ui", "clean_up", null);

		for (var i = 0; i < current_user.role.models.length; ++i) {
			var model_name = current_user.role.models[i];
			if (undefined === glob.app[model_name]) {
				log.error = func+"module \""+model_name+"\" ="+glob.app[model_name]+" is not loaded;"; // task error
				return;
			}
			this.task.run_sync("model", model_name, "init", current_user);
		}

		this.task.success();
	}
	function test() {
		return 255;
	}
})(window);
