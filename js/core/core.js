;(function(glob) {
	"use strict";
	// TODO early exit, test container functionality
	// define static data
	
	// create app resources
	var browser_state;
	var core_debug = ["", "model-user", "user-guest", "core-log", "ui_element"];
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
		Object.defineProperty(this, "message", {
			set: handle_message,
			get: function() { return null; }
		});
		Object.defineProperty(this, "model_data", {
			set: handle_model_data,
			get: function() { return null; }
		});
		Object.defineProperty(this, "Logger", {
			set: function(d) { return null; },
			get: function() { return Logger; }
		});
		this.l = log;
	}
	function handle_message(message) {
		var func_name = "handle_message(): ";
		log.info = func_name + "message = " + message;
		if (5 > message.length) {
			// TODO core error
			log.error = func_name + "message.length = "+message.length;
			return;
		}
		if (!core[message[2]]) {
			log.error = func_name + "module <"+message[2]+"> is "+core[message[2]];
			return;
		}
		if (!core[message[2]][message[3]]) {
			log.error = func_name + "module <"+message[2]+"> has no "+message[3]+" interface: "+core[message[2]][message[3]];
			return;
		}
/*
		if (!Array.isArray(message[4]) || 0 === message[4].length){
			log.error = func_name + "message data is not array or length = 0: "+message[4];
			return;
		}
*/
		//glob.app[message[2]][message[3]] = message[4];
		core[message[2]][message[3]] = message[4];
	}
	function handle_model_data(message) {
		var func_name = "handle_model_data(): ";
		log.info = func_name + "message = " + message;
		if (5 > message.length) {
			// TODO core error
			log.error = func_name + "message.length = "+message.length;
			return;
		}
		if (!glob.app[message[2]]) {
			log.error = func_name + "module <"+message[2]+"> is "+glob.app[message[2]];
			return;
		}
		if (!glob.app[message[2]][message[3]]) {
			log.error = func_name + "module <"+message[2]+"> has no "+message[3]+" interface: "+glob.app[message[2]][message[3]];
			return;
		}
/*
		if (!Array.isArray(message[4]) || 0 === message[4].length){
			log.error = func_name + "message data is not array or length = 0: "+message[4];
			return;
		}
*/
		glob.app[message[2]][message[3]] = message[4];
	}
	function browser_event_handler(message) {
		switch (message) {
			case "ready":
				browser_state = "ready";
				//core.core_loader.log.error;
				//core.data_loader.log.error;
				//log.error;
				//log.info;
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
				glob.app.user.current = core.user.current;
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
			// already loaded or the name is occupied
			log.info = "load_module(): to be loaded <"+module[0]+"> with index "+index;
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
		//var debug = glob.core_debug.indexOf(name);
		var debug = core_debug.indexOf(name);
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
