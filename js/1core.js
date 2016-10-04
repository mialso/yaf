;(function(glob) {
	"use strict";
	// TODO early exit, test container functionality
	// define static data
	
	// create app resources
	var browser_state;
	var core_debug = ["", "", "", "", "", ""];
	glob.core_debug = core_debug;

	// create app object in container
	glob.app = {};
	glob.app.core  = new Core();
	var core = glob.app.core;
	
	glob.onload = function() {
		core.browser = "ready";
	};
	var log;

	// module constructor
	function Core() {
		this.debug = core_debug;
		this.core_loader = new Loader(this, this, "core");
		this.data_loader = new Loader(glob.app, this, "app");
		this.test = new Tester();
		log = new Logger("core-log");
		Object.defineProperty(this, "browser", {
			set: browser_event_handler,
			get: function() { return browser_state; }
		});
		this.Logger = Logger;
	}
	function browser_event_handler(message) {
		switch (message) {
			case "ready":
				browser_state = "ready";
				for (var i = 0; i < core.core_loader.module.length; ++i) {
					if (undefined !== core.core_loader.loaded[i]) {
						core.test.test = core.core_loader.module[i];
					}
				}
				for (var i = 0; i < core.data_loader.module.length; ++i) {
					if (undefined !== core.data_loader.loaded[i]) {
						core.test.test = core.data_loader.module[i];
					}
				}
				core.user.init_user();
				break;
			default:
				break;
		}
	}
	function Loader(parent_obj, dep_obj, name) {
		var log = new Logger(name + "-loader");
		var modules = [];
		var not_loaded_names = [];
		var loaded_names = [];
		var broken_modules = [];
		Object.defineProperty(this, "module", {
			set: add_module,
			get: function() { return modules; }
		});
		Object.defineProperty(this, "loaded", {
			set: function(d) { return null; },
			get: function() { return loaded_names; }
		});
		Object.defineProperty(this, "not_loaded", {
			set: function(d) { return null; },
			get: function() { return not_loaded_names; }
		});
		Object.defineProperty(this, "log", {
			set: function(d) { return null; },
			get: function() { return log; }
		});
		Object.defineProperty(this, "broken", {
			set: remove_module,
			get: function() { return broken_modules; }
		});
		function remove_module(module) {
			// TODO :possible graph implementation
		}
		function add_module(module) {
			var index = modules.push(module);
			--index;
			log.info = "add_module(): new module <" + module[0] + "> at index "+index;
			if (not_loaded_names[index] !== undefined) {
				log.error = "add_module(): not_loaded_names index exists at [" + index + "] for " + modules.pop()[0];
				return;
			}
			not_loaded_names[index] = module[0];
			load_module(module, index);
		}
		function load_module(module, index) {
			log.info = "load_module(): to be loaded <"+module[0]+"> with index "+index;
			// already loaded or the name is occupied
			if (parent_obj.hasOwnProperty(module[0])) {
				log.error = "load_module(): module <"+ module[0] + "> is already exists";
				return;
			}
			var dependencies_ok = true;
			var modules_loaded = Object.keys(dep_obj);
 			log.info = "load_module(): core modules loaded: " + modules_loaded;
			for (var i=0; i < module[1].length; ++i) {
				if (-1 === modules_loaded.indexOf(module[1][i])) {
					dependencies_ok = false;
				}
			}
			if (dependencies_ok) {
				parent_obj[module[0]] = new module[2]();
/*
				// TODO try to implement this throw ongoing tasks
				var new_module = new module[2]();
				new_module.log = new core.log.Module([new_module.name, new_module.id]);
				new_module.task = new Task([new_module.name, new_module.id]);
				core.model.Model.call(new_module);
*/
				
				log.info = "load_module(): module <"+ module[0] + "> loaded as <" + parent_obj[module[0]] + ">";
				loaded_names[index] = module[0];
				not_loaded_names[index] = undefined;
				// try to load others, who waits
				for (var i=0; i < modules.length; ++i) {
					if (undefined === not_loaded_names[i]) {
						continue;
					}
					load_module(modules[i], i);
				}
			}
		}
	}
	function Tester() {
		var tests = [];
		var log = new Logger("core-test");
		var success_tests = [];
		var error_tests = [];
		Object.defineProperty(this, "log", {
			set: function(d) {return null;},
			get: function() {return log;}
		});
		Object.defineProperty(this, "test", {
			set: module_test,
			get: function() { return tests; }
		});
		Object.defineProperty(this, "success", {
			set: function(data) {
				success_tests.push(data);
				log.info = "module_test(): success <"+data+"> test";
			},
			get: function() { return success_tests; }
		});
		Object.defineProperty(this, "error", {
			set: function(data) {
				error_tests.push(data);
				log.error = "module_test(): error in <"+data+"> test";
			},
			get: function() { return error_tests; }
		});
		function module_test(module) {
			var module_name = module[0];
			tests.push(module_name);
			var result = module[3]();
			(0 == result) ? this.success = module_name : this.error = module_name;
		}
	}
	function Logger(name) {
		var error_log = [];
		var info_log = [];
		var module_name = name.toUpperCase();
		var debug = core_debug.indexOf(name.split("-").pop());
		Object.defineProperty(this, "error", {
			set: function(data) {
				var message = "[ERROR]: <"+module_name+">: " + data;
				error_log.push(message);
				if (-1 !== debug || "off" !== core_debug[0]) {
					console.log(message);
				}
			},
			get: function() {
				if (0 === error_log.length) {
					console.log("[LOG]: <"+module_name+">: {ERROR}: empty");
					return;
				}
				for (var i = 0; i < error_log.length; ++i) {
					console.log(error_log[i]);
				}
			}
		});
		Object.defineProperty(this, "info", {
			set: function(data) {
				var message = "[INFO]: <"+module_name+">: " + data;
				info_log.push(message);
				if (-1 !== debug || "all" === core_debug[0]) {
					console.log(message);
				}
			},
			get: function() {
				if (0 === info_log.length) {
					console.log("[LOG]: <"+module_name+">: {INFO}: empty");
					return;
				}
				for (var i = 0; i < info_log.length; ++i) {
					console.log(info_log[i]);
				}
			}
		});
	}
})(window);
