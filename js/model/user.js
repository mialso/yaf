;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;	

	// init static data
	var module_data = [
		"user",
		["err", "log", "ui"],
		User,
		test
	];
	var module_UI = ["header", "main", "footer", "login"];
	var core = glob.app.core;
	// load module
	core.data_loader.module = module_data;

	function User() {
		var current_user = {};
		var role = {};
		var UI = {};
		this.log = {};
		//this.module_log = new core.log.Logger("user");
		// create current user
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return current_user; }
		});
		Object.defineProperty(this, "ui", {
			set: set_ui,
			get: function() { return UI; }
		});
		Object.defineProperty(this, "ui_ready", {
			set: update_ui,
			get: function() {return null;}
		});
		this.login = function(name, passw) {
			console.log(name);
			console.log(passw);
		};
		function set_ui(el) {
			console.log("{user}: set_ui(): arr = %s", el);
			var name = el.name;
			UI[name] = el;
			if (current_user.actions[name]) {
				UI[name].actions = current_user.actions[name];
			}
		}
		function update_ui(name) {
			if (!name) {
				console.log("{user}: update_ui(): error: %s", name);
				return;
			}
			console.log("{user}: update_ui() %o", UI);
			console.log("{user}: ui name = %s", name);
			var p = UI[name].parnt;
			console.log("{user}: update_ui(): UI[ui_name].parnt = "+p);
			core.ui.containers[p].insert(UI[name]);
			//update_actions();
		}
		function update_user(user) {
			console.log("{user}: update_user(): user = %s", user);
			if (current_user.name !== user.name) {
				this.log[user.name] = new core.log.Logger(user.name);
				this.log[user.name].info = "update_user(): new user = "+JSON.stringify(user);
				current_user = user;
				core.ui.model = ["user", user.UI];
			}
		}
		function init_user() {
			current_user = core.user.current;
		}
	}
	
	function test() {
		return 1;
	}
})(window);
