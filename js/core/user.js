;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"user",
		["err", "log", "ui"],
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
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return current_user; }
		});
		this.login = login;
		this.logout = logout;
		//this.models = {};
		
		function update_user(new_user) {
			var func = "update_user(): ";
			// load data models, user allowed to
			var roles = Object.keys(roles);
			if (-1 === roles.indexOf(new_user.role)) {
				log.error = func+"the role ="+new_user.role+" does not exist";
				return;
			}
			current_user.name = new_user.name;
			current_user.role = roles[new_user.role];
			current_user.role_name = new_user.role;
		}
	}
	function logout() {
		current_user.role.models.forEach(function(model_name) {
			if (undefined === glob.app[model_name]) {
				log.error = func+"module \""+model_name+"\" ="+glob.app[model_name]+" is not loaded;";
				return;
			}
			glob.app[model_name].clean_up();
		});
		
		get_user(["std", ""]);
	}
	function login(data) {
		var func = "login(): ";
		log.info = func+"data ="+JSON.stringify(data);
		if (!data) {
			var data = ["std", ""];
		}
		get_user(data);
		
	}
	function get_user([name, passw]) {
		var func = "get_user(): ";
		log.info = func+"name ="+name+" , pass ="+passw;
		var user_names = Object.keys(users);
		if (-1 === user_names.indexOf(name)) {
			log.error = func+"user \""+name+"\" does not exist";
			return;
		}
		var new_user = users[name];
		var role_names = Object.keys(roles);
		if (-1 === role_names.indexOf(new_user.role)) {
			log.error = func+"role \""+new_user.role+"\" does not exist";
			return;
		}
		// check passw
		if (passw !== new_user.passw) {
			log.error = func+"passw \""+passw+"\" is not correct";
			return;
		}
		// set user as current
		current_user.name = new_user.name;
		current_user.role = roles[new_user.role];
		current_user.role_name = new_user.role;
		// init data modules
		//glob.app.user.user = current_user;
		core.ui.clean_up();
		current_user.role.models.forEach(function(model_name) {
			if (undefined === glob.app[model_name]) {
				log.error = func+"module \""+model_name+"\" ="+glob.app[model_name]+" is not loaded;";
				return;
			}
			glob.app[model_name].user = current_user;
		});
	}
	function test() {
		return 1;
	}
})(window);
