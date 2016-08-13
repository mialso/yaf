;(function(glob) {
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	var module_data = [
		"err", 				// name
		["tst", "log"],		// core dependencies
		Err,				// constructor
		test				// self test
	];

	var internals = [];
	var tests = [];

	// load module consrtuctor to app
	var app = glob.app;
	app.core_module = module_data;

	function Err() {
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
		});
	}
	function test() {
		// success return
		return 1;
	}
})(window);
