;(function(glob) {
	
	// define static data
	var module_data = {
		name: "core"
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	// create app resources
	var app = glob.app;
	var modules = [];
	var modules_wanted = [];
	var core_errors = [];

	glob.onload = function() {
		app["core"] = Core();
		app.log.info = ["core", "app modules: "+modules];
		test_dependencies(modules_wanted, modules);
		app.tst.modules_test(modules);
		app.user.init_user();
	}

	// module constructor
	function Core() {
		//app.log.info = ["core", "in constructor"];
		Object.defineProperty(this, "module", {
			set: module_load,
			get: function() { return null; }
		})
		Object.keys(glob.app.module).forEach(function(val, ind, arr) {
			module_load(val);
		});
	}
	function test_dependencies(dep_arr, mod_arr) {
		var error = 0;
		var success = 0;
		// TODO remember map algorithm
		dep_arr.forEach(function(dep, ind, arr) {
			success = 0;
			mod_arr.forEach(function(mod, ind, arr) {
				success += (dep === mod) ? 1 : 0;
			});
			if (!success) {
				app.err.test = "<core>: test_dependencies(): module "+dep+" is not found";
				++error;
			}
		});
		if (!error) {
				app.log.info = ["core", "test_dependencies(): SUCCESS"];
		} else {
				app.log.info = ["TEST", app.err.test];
		}
	}
	function module_load(module_name) {
		glob.app[module_name] = new glob.app.module[module_name]();
		glob.app[module_name].dependencies.forEach(function(val, ind, arr) {
			modules_wanted.push(val);
		});
		delete glob.app.module[module_name];
		modules.push(module_name);
	}

})(window);
