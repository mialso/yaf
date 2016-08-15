;(function(glob) {
	"use strict";
	// TODO early exit, test container functionality
	// define static data
	
	// create app resources
	var current_state;
	var container_state;

	// create app object in container
	var core = {};
	glob.app = {};
	core = glob.app.core  = new Core();
	
	glob.onload = function() {
		core.container = "ready";
	};

	// module constructor
	function Core() {
		this.core_loader = new Loader(core, core);
		this.data_loader = new Loader(glob.app, core);
		//this.snapshot = new Snapshot();
		Object.defineProperty(this, "container", {
			set: container_event_handler,
			get: function() { return container_state; }
		});
	}
	function container_event_handler(message) {
		switch (message) {
			case "ready":
				container_state = "ready";
				core.core_loader.log.info;
				core.core_loader.log.error;
				core.data_loader.log.info;
				core.data_loader.log.error;
				break;
			default:
				break;
		}
	}
/*
	function change_state(name) {
		switch (name) {
			case "load": load();
				break;
			case "boot":
				("load" === current_state) ? boot() : core.state = "error";
				break;
			case "test":
				test();
				break;
			case "ready":
				("test" === current_state) ? ready() : core.state = "error";
				break;
			case "error":
				error();
				break;
			default: 
				// TODO handle error
				change_state("error");
				console.log("[ERROR]: <core>: change_state(): no such state");
				break
		}
	}
	function test() {
		current_state = "test";
		var test_ok = [];
		var test_fail = [];

		core.core_loader.module.forEach(function(module) {
			var test_res = 0;
			test_res = module[3]();
			if (test_res) {
				test_ok.push(module[0]);
			} else {
				test_fail.push(module[0]);
			}
		});
		//core.snapshot.test = "test fail: "+test_fail;
		//core.snapshot.test = "test OK: " + test_ok;
		change_state("ready");
	}
	function ready() {
		current_state = "ready";
		console.log("core is ready");
	}
	function error() {
		current_state = "error";
		console.log("core error");
	}
*/
	function Loader(parent_obj, dep_obj) {
		var log = new Core_log("loader");
		var modules = [];
		//var loaded = [];
		var not_loaded_names = [];
		var loaded_names = [];
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
	function Core_log(name) {
		var error_log = [];
		var info_log = [];
		var module_name = name.toUpperCase();
		Object.defineProperty(this, "error", {
			set: function(data) {
				var message = "[ERROR]: <"+module_name+">: " + data;
				error_log.push(message);
			},
			get: function() {
				for (var i = 0; i < error_log.length; ++i) {
					console.log(error_log[i]);
				}
			}
		});
		Object.defineProperty(this, "info", {
			set: function(data) {
				var message = "[INFO]: <"+module_name+">: " + data;
				info_log.push(message);
			},
			get: function() {
				for (var i = 0; i < info_log.length; ++i) {
					console.log(info_log[i]);
				}
			}
		});
	}
})(window);
