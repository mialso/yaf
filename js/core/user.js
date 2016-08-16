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
		var user;
		Object.defineProperty(this, "current", {
			set: update_user,
			get: function() { return user; }
		});
		function update_user(user) {
			// load UI
			for (var i = 0; i < user.UI.length; ++i) {
				core.ui.model = user.UI[i];
			}

		}
	}
	function test() {
		return 1;
	}
})(window);
