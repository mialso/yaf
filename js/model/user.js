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
	var instance_ui = {
		guest: {
			ui: ["login"],
			actions: {
 				login: ["login", "app.core.user.login([u_name.value, u_pass.value]);return false"]
			}
		},
		manager: {},
		admin: {
			ui: ["user_menu_entry"],
			actions: {
				user_menu_entry: ["show", "app.user.show();"]
			}
		}
	};
/*
	var model_ui = {
		ui: [],
		actions: {}
	};
*/
	var core = glob.app.core;
	// load module
	var message = ["user_model"];
	var log = new core.Logger("model-user");
	core.data_loader.module = module_data;
	//var log;
	var u_log = {};

	function User_model() {
		log.info = "User_model(): new model create";
		this.log = log;

		this.instance;
		this.ui_config;
		this.actions;
		this.message = message.concat([""]);
		//var role = {};
		this.ui = {};
		this.set_ui = set_ui;
		Object.defineProperty(this, "l", {
			set: function(d) {return null;},
			get: function() {return log;}
		});
		Object.defineProperty(this, "user", {
			set: init_model.bind(this),
			get: function() { return this.instance; }
		});
		Object.defineProperty(this, "ui_ready", {
			set: set_model_ui.bind(this),
			get: function() { return true; }
		});
		this.login = function(name, passw) {
			console.log(name);
			console.log(passw);
		};
		this.show = function() {
			console.log("user show");
			glob.document.querySelector(".dash_header").innerHTML = "Users";
		}
	}
	function set_model_ui(data) {
		var func = "set_model_ui(): ";
		this.log.info = func+" user ="+data.model.id+", data = "+JSON.stringify(data);
		if (undefined !== data.model.id && null !== data.model.id) {		
			this.instance.set_ui(data);
		} else {
			// set ui data 
			this.set_ui(data);
		}
	}
	//function update_user(user) {
	function init_model(user) {
		var func = "init_model(): ";
		this.log.info = func+" user ="+JSON.stringify(user);

		// init model static data

		// create model instance
		if (undefined === this.instance || this.instance.name !== user.name) {
			this.instance = new User(user);
		}

		// init model ui
		this.actions = user.role.actions;
		this.ui_config = user.role.UI;
		core.message = this.message.concat(["ui", "model", ["user", this.ui_config]]);
	}
	
	function User(user) {
		var func = "User(): ";
		if (!user) {
			log.error = func+"no user data provided ="+user;
			return;
		} else {
			log.info = func+" new user ="+JSON.stringify(user);
		}
		
		this.name = user.name;
		this.log = new core.Logger("user-"+this.name);


		this.message = message.concat(["User:"+this.name]);

		this.actions = instance_ui[user.role_name].actions;
		this.ui_config = instance_ui[user.role_name].ui;
		this.ui = {};
		this.set_ui = set_ui;

		// send request to create ui
		core.message = this.message.concat(["ui", "model", ["user>"+this.name, this.ui_config]]);
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
