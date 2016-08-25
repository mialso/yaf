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
	var message = ["user_model"];

	function User_model() {
		Object.defineProperty(this, "l", {
			set: function(d) {return null;},
			get: function() {return log;}
		});
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return current_user; }
		});
		Object.defineProperty(this, "ui", {
			set: set_model_ui,
			get: function() { return true; }
		});
		this.login = function(name, passw) {
			console.log(name);
			console.log(passw);
		};
	}
	function set_model_ui(data) {
		var func = "set_model_ui(): ";
		log.info = func+" user ="+data.model_id+", data = "+JSON.stringify(data);
		current_user.set_ui(data);
	}
	function update_user(user) {
		var func = "update_user(): ";
		if (current_user.name !== user.name) {
			log.info = func+"new user ="+JSON.stringify(user);
			u_log[user.name] = new core.Logger("user-"+user.name);
			current_user = new User(user);
			core.message = message.concat(["", "ui", "model", ["user>"+current_user.name, current_user.ui_config]]);
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

		this.message = message.concat(["User:"+user.name]);

		this.name = user.name;
		this.actions = user.actions;
		//var role = {};
		this.ui_config = user.UI;
		this.ui = {};
		this.set_ui = set_ui;
	}
	function set_ui(el) {
		var func = "set_ui(): ";
		this.log.info = func+"el ="+JSON.stringify(el);
		var name = el.name;
		this.ui[name] = el;
		if (this.actions[name]) {
			this.log.info = func+"ui["+name+"] action <"+this.actions[name]+"> created";
			this.ui[name].actions = this.actions[name];
		}
		core.message = this.message.concat(["ui", "container", [this.ui[name].parnt, this.ui[name]]]);
	}
	function test() {
		return 1;
	}
})(window);
