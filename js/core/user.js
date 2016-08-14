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
	// define default user data
	var default_user = {
		name: "guest",
		UI: ["header", "main", "footer"]
	}
	// create app resources
	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;

	// module constructor
	function User() {
		this.init_user = init_user;
	}
	function init_user() {
		core.ui.push_to_dom();
	}
	function test() {
		return 1;
	}
})(window);
