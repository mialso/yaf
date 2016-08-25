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
	var guest = {
		name: "guest",
		UI: ["header", "main", "footer", "login"],
		actions: {
			login: ["login", "app.user.login(u_name.value, u_pass.value);return false;"]
		}
	};
	var roles = {
		guest: {
			UI: ["header", "main", "footer", "login"],
			actions: {
				login: ["login", "app.user.login(u_name.value, u_pass.value);return false;"]
			},
			models: ["user"]
		},
		manager: {
			UI: ["header", "main", "footer", "login"],
			actions: {
				logout: ["logout", "app.user.login(u_name.value, u_pass.value);return false;"]
			},
			models: ["user", "project"]
		},
		admin: {
			UI: ["header", "main", "footer", "login"],
			actions: {
				logout: ["logout", "app.user.login(u_name.value, u_pass.value);return false;"]
			},
			models: ["user", "project", "app"]
		}
	};
	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;

	// module constructor
	function User() {
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return roles.current; }
		});
		
		function update_user(new_user) {
			// load data models, user allowed to
		}
	}
	function test() {
		return 1;
	}
})(window);
