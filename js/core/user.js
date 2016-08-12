;(function(glob) {
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = {
		name: "user",
		dependency: ["err", "log", "ui"]
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	// create app resources
	// load module consrtuctor to app
	var app = glob.app;
	app.module["user"] = User;

	// module constructor
	function User() {
		this.self_test = test;
		this.dependencies = module_data.dependency;
		this.init_user = init_user;
	}
	function init_user() {
		app.ui.push_to_dom(["header", "main", "footer"]);
	}
	function test() {
		return 1;
	}
})(window);
