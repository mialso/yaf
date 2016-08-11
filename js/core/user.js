;(function(glob) {
	
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
	var app = glob.app;
	app.module["user"] = User;

	// module constructor
	function User() {
		this.self_test = test;
		this.dependencies = module_data.dependency;
		this.init_user = init_user;
	}
	function init_user() {
		app.ui.push_to_dom(["header"]);
	}
	function test() {
		return 1;
	}
})(window);
