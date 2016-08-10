;(function(glob) {
	
	var module_data = {
		name: "log",
		dependency: ["err", "log"]
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	var mock = {};
	var app = glob.app;

	app.module["tst"] = Tst;

	function Tst() {
		this.test = test;
		this.modules_test = modules_test;
		this.dependencies = module_data.dependency;
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
			success_counter += app[val].test();
		})
		if (counter === success_counter) {
			console.log("[SUCCESS]: tst: all tests passed");
		} else {
			// TODO report errors
			console.log("[ERROR]: tst: %s not passed", counter - success_counter);
		}
	}

})(window);
