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
	var internals = [];
	var tests = [];

	app.module["err"] = Err;

	function Err() {
		this.self_test = test;
		this.dependencies = module_data.dependency;
		Object.defineProperty(this, "internal", {
			set: function(message) {
				internals.push(message);
			},
			get: function() { return internals;}
		});
		Object.defineProperty(this, "test", {
			set: function(message) {
				tests.push(message);
			},
			get: function() {return tests;}
		})
	}
	function test() {
		// success return
		return 1;
	}
})(window);
