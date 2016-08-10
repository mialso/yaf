;(function(glob) {
	
	var module_data = {
		name: "err",
		dependency: ["tst", "log"]
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	var app = glob.app;

	app.module["err"] = Err;

	function Err() {
		this.test = test;
		this.dependencies = module_data.dependency;
	}
	function test() {
		// success return
		return 1;
	}
})(window);
