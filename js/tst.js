;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;

	var module_data = [
		"tst",
		["err"],
		Tst,
		test
	];

	var mock = {};
	var errors = [];

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;

	function Tst() {
		this.modules_test = modules_test;
		Object.defineProperty(this, "error", {
			set: error_add,
			get: function() {return errors}
		});
	}
	function error_add(error) {
		errors.push(error);
		core.log.info = ["tst", "[ERROR]: <"+error.module+">: ("+error.func+"): "+error.scope+"; result = "+JSON.stringify(error.result)];
	}
	function test() {
		// success return
		return 1;
	}
	function modules_test(modules) {
		var counter = 0;
		var success_counter = 0;
		modules.forEach(function(val, ind, arr) {
			counter++;
			success_counter += app[val].self_test();
		});
		if (counter === success_counter) {
			core.log.info = ["tst", "all tests passed"];
		} else {
			// TODO report errors by modules, suites and cases
			console.log("[ERROR]: tst: %s not passed", counter - success_counter);
		}
	}

})(window);
