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
	var default_user = {
		name: "guest",
		UI: {
			app: ["header", "main", "footer"],
			app_main: ["login"]
		}
	}
	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;

	// module constructor
	function User() {
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return default_user; }
		});
		
		function update_user(new_user) {
			// load data models, user allowed to
		}
	}
	function test() {
		return 1;
	}
})(window);
