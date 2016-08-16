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
	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;

	// module constructor
	function User() {
		var UI = {};
		Object.defineProperty(this, "ui", {
			set: function(g) {return null;},
			get: function() { return UI; }
		});
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return null; }
		});
		function update_user(new_user) {
			new_user.UI.forEach(function(name) {
				UI[name] = new app.core.ui_element.Element(name);
			});
		}
	}
	function test() {
		return 1;
	}
})(window);
