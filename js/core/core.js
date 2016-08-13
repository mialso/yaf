;(function(glob) {
	// TODO early exit, test container functionality
	// define static data
	var module_data = {
		name: "core"
	};
	// create app object in container
	glob.app = {};
	var app = glob.app;
	app.core_module = {};
	app.core = new Core();
	
	// create app resources
	var core_modules = [];
	var data_modules = [];
	var core_modules_wanted = [];
	//var core_errors = [];

	glob.onload = function() {
		init_all_modules();
		
		test_dependencies(core_modules_wanted, core_modules);
		app.tst.modules_test(core_modules);
		app.user.init_user();
	}

	// module constructor
	function Core() {
		Object.defineProperty(this, "core_module", {
			set: function(module) {return boot_module("core", module);},
			get: function() { return core_modules; }
		});
		Object.defineProperty(this, "data_module", {
			set: function(module) {return boot_module("data", module);},
			get: function() { return data_modules; }
		});
		this.Module = Module;
	}
	function init_all_modules() {
		Object.keys(app.core_module).forEach(function(val, ind, arr) {
			app.core.core_module = val;
		});
		Object.keys(app.data_module).forEach(function(val, ind, arr) {
			app.core.data_module = val;
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
				// TODO refactor to inform which module dependency is not found
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
	function get_module_load(type) {
		// TODO remove this great construction))))
		switch (type) {
					case "core":
					case "data":
						break;
					case "default":
						// TODO error handling
						return null;
		}
		return function(module_data) {
			// TODO check deprecated names(used by core itself) and also by double name existence
			var m_name = module_data[0];
			app[type][m_name] = new Module(module_data);
			glob.app[type][m_name] = new Module(module_data);
		};
	}
	function Module(module_data) {
		populate_dependencies(module_data[1]);
		var self = new module_data[2]();
		self.name = module_data[0];
		self.self_test = module_data[3];
		this = self;
	}
	function populate_dependencies(arr) {
		arr.foreEach(function(val) {
			if (-1 === core_modules_wanted.indexOf(val)) {
				core_modules_wanted.push(val);
			}
		}); 
	}
})(window);
