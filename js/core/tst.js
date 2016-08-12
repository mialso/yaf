;(function(glob) {
	// early exit
	if (!glob.app || !glob.app.core) return;

	var module_data = {
		name: "log",
		dependency: ["err", "log"]
	};

	var mock = {};
	var errors = [];

	// load module consrtuctor to app
	var app = glob.app;
	app.module["tst"] = Tst;

	function Tst() {
		this.self_test = test;
		this.modules_test = modules_test;
		this.dependencies = module_data.dependency;
		Object.defineProperty(this, "error", {
			set: error_add,
			get: function() {return errors}
		});
	}
	function error_add(error) {
		errors.push(error);
		app.log.info = ["tst", "[ERROR]: <"+error.module+">: ("+error.func+"): "+error.scope+"; result = "+JSON.stringify(error.result)];
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
			app.log.info = ["tst", "all tests passed"];
		} else {
			// TODO report errors by modules, suites and cases
			console.log("[ERROR]: tst: %s not passed", counter - success_counter);
		}
	}

})(window);
