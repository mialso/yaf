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
	]
	var module_UI = ["header", "main", "footer"];
	var core = glob.app.core;
	// load module
	core.data_loader.module = module_data;

	function User() {
		var current_user = {};
		var UI = {};
		// create current user
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return current_user; }
		});
		Object.defineProperty(this, "ui", {
			set: update_ui,
			get: function() { return UI; }
		});
		function update_user(user) {
			// TODO compare objects ???
			if (current_user !== user) {
				current_user = user;
			}
			if (UI !== current_user.UI) {
				core.ui.model = current_user.UI;
			}
			return;
		}
		function update_ui(ui_data) {
			ui_data.UI.forEach(function(name) {
				UI[name] = new app.core.ui_element.Element(name);
			});
			return UI;
		}
		function init_user() {
			current_user = core.user.current;
		}
		if (core.user) {
			//this.current = core.user.current;
			update_user(core.user.current);
		} else {
			// TODO error handle
		}
	}
	
	function test() {
		return 1;
	}
})(window);
