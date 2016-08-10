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
	var modules = [];
	var modules_wanted = [];

	glob.onload = function() {
		this.app["core"] = Core();
		console.log("app modules: %s", Object.keys(this.app));
		test_dependencies(modules_wanted, modules);
		app.tst.modules_test(modules);
	}

	// module constructor
	function Core() {
		console.log("Core constructor");
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
			mod_arr.forEach(function(mod, ind, arr) {
				success += (dep === mod) ? 1 : 0;
			});
			if (!success) {
				console.log("[ERROR]: dependency check: module %s not found", dep);
				error++;
			}
		});
		if (error) {
			console.log("[ERROR]: dependency check error, num = %s", error);
		} else {
			console.log("[SUCCESS]: dependency check");
		}
	}
	function module_load(module_name) {
		console.log("Core: new module: %s", module_name);
		glob.app[module_name] = new glob.app.module[module_name]();
		glob.app[module_name].dependencies.forEach(function(val, ind, arr) {
			modules_wanted.push(val);
		});
		delete glob.app.module[module_name];
		modules.push(module_name);
	}

})(window);
