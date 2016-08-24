;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;	

	// init static data
	var module_data = [
		"user",
		["err", "log", "ui", "user", "net"],
		User_model,
		test
	];
	var module_UI = ["header", "main", "footer", "login"];
	var core = glob.app.core;
	// load module
	core.data_loader.module = module_data;
	var log = new core.Logger("model-user");
	var u_log = {};
	var current_user = {};

	function User_model() {
		Object.defineProperty(this, "l", {
			set: function(d) {return null;},
			get: function() {return log;}
		});
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return current_user; }
		});
		this.login = function(name, passw) {
			console.log(name);
			console.log(passw);
		};
	}
	function update_user(user) {
		var func = "update_user(): ";
		if (current_user.name !== user.name) {
			log.info = func+"new user ="+JSON.stringify(user);
			u_log[user.name] = new core.Logger("user-"+user.name);
			current_user = new User(user);
			//core.ui.model = ["user", user.UI];
		}
	}
	
	function User(user) {
		var func = "User(): ";
		if (!user) {
			log.error = func+"no user data provided ="+user;
			return;
		}
		u_log[user.name] = new core.Logger("user-"+user.name);
		this.log = u_log[user.name];

		this.name = user.name;
		this.actions = user.actions;
		//var role = {};
		this.ui_config = user.UI;
		this.ui = {};
		Object.defineProperty(this, "ui_ready", {
			set: update_ui.bind(this),
			get: function() {return null;}
		});
	}
	function set_ui(el) {
		var func = "set_ui(): ";
		this.log.info = func+"el ="+JSON.stringify(el);
		var name = el.name;
		this.ui[name] = el;
		if (this.actions[name]) {
			this.log.info = func+"ui["+name+"] action <"+actions[name]+"> created";
			this.ui[name].actions = this.actions[name];
		}
		update_ui(name);
	}
	function update_ui(name) {
		var func = "update_ui(): ";
		if (!name) {
			this.log.error = func+"no name="+name;
			return;
		}
		var p = UI[name].parnt;
		this.log.info = func+"UI["+name+"] parnt ="+p;
		core.ui.containers[p].insert(UI[name]);
		//update_actions();
	}
	
	function test() {
		return 1;
	}
})(window);
