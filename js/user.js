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
	var role_names = ["guest", "manager", "admin"];
	var roles = [
		{	// guest
			models: ["user", "app"]
		},
		{	// manager
			models: ["app", "user", "project"]
		},
		{ 	// admin
			models: ["user", "project", "app"]
		}
	];
		/*
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
		*/
	var guest = {
		name: "guest",
		role: "guest",
		passw: ""
	};

	var current_user = {
		name: guest.name,
		role: roles[guest.role],
		role_name: guest.role
	};
	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("core-user");
	core.core_loader.module = module_data;

	// module constructor
	function User() {
		this.name = "user";
		this.id = "core";
		this.global_id = this.name+">"+this.id;

			/*
		this.login = core.task.create(["login", login]);
			*/
		this.logout = core.task.create(["logout", logout]);
		this.init_user = core.task.create(["init_user", init_user]);
	}
	function logout() {
			/*
		this.task.run_async("core", "user", "login", [guest.name, guest.passw]);
			*/
		this.task.run_async("core", "user", "init_user", [guest.name, guest.passw]);
	}
		/*
	function login(data) {
		var func = "login(): ";
		this.task.debug(func+"data ="+JSON.stringify(data));

		if (!data || !Array.isArray(data) || 2 > data.length) {
			var data = [guest.name, guest.passw];
		}
		get_user.call(this, data);
	}
	function get_user([name, passw]) {
		var func = "get_user(): ";
		this.task.debug(func+"name ="+name+" , pass ="+passw);
		var user_names = Object.keys(users);
		if (-1 === user_names.indexOf(name)) {
			this.task.error(func+"user \""+name+"\" does not exist");
			return;
		}
		var new_user = users[name];
		var role_names = Object.keys(roles);
		if (-1 === role_names.indexOf(new_user.role)) {
			this.task.error(func+"role \""+new_user.role+"\" does not exist");
			return;
		}
		// check passw
		if (passw !== new_user.passw) {
			this.task.error(func+"passw \""+passw+"\" is not correct");
			return;
		}
		init_new_user.call(this, new_user);
	}
	function init_new_user(new_user) {
		*/
	function init_user(new_user_data) {
		var func = "init_user(): ";
			console.log("DDDDD: %s = %o", func, new_user_data)
		if (!new_user_data || !Array.isArray(new_user_data) || (4 !== new_user_data.length)) {
			console.log("DDDDD: guest")
			var new_user_data = [];
			new_user_data[1] = guest.name;
			new_user_data[3] = 0;
				/*
			new_user_data[2] = guest.passw;
				*/
		}
		// validate role
		if (new_user_data[3] > roles.length) {
			this.task.error(func+"role \""+new_user_data[1]+"\" does not exist");
			console.log("DDDDD: ERRR")
			return;
		}
			/*
		var role_names = Object.keys(roles);
		if (-1 === role_names.indexOf(new_user_data[3])) {
			this.task.error(func+"role \""+new_user_data[1]+"\" does not exist");
			console.log("DDDDD: ERRR")
			return;
		}
			*/
		// set user as current
		current_user.name = new_user_data[1];
		current_user.role = roles[new_user_data[3]];
		current_user.role_name = role_names[new_user_data[3]];

		// clean up
		for (var i =0; i < current_user.role.models.length; ++i) {
			var model_name = current_user.role.models[i];
			this.task.run_sync("model", model_name, "clean_up", null);
		}
		this.task.run_sync("core", "ui", "clean_up", null);

		// init data models
		for (var i = 0; i < current_user.role.models.length; ++i) {
			var model_name = current_user.role.models[i];
			this.task.run_async("model", model_name, "init", current_user);
		}
	}
	function test() {
		return 255;
	}
})(window);
