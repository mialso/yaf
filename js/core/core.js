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
	//glob.app.core = {};
	glob.app.core = new Core();
	var core = glob.app.core;
	//glob.app.core = core;
	
	glob.onload = function() {
		core.container = "ready";
	};

	// module constructor
	function Core() {
		this.core_loader = new Loader(core);
		this.data_loader = new Loader(glob.app);
		this.snapshot = new Snapshot();
		Object.defineProperty(this, "container", {
			set: container_event_handler,
			get: function() { return container_state; }
		});
	}
	function container_event_handler(message) {
		switch (message) {
			case "ready":
				container_state = "ready";
				core.snapshot.load = "core_modules not loaded: "+core.core_loader.not_loaded;
				core.snapshot.load = "data_modules not loaded: "+core.data_loader.not_loaded;
				break;
			default:
				break;
		}
	}
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
	function load() {
		current_state = "load";
		// check core (self test) TODO
		core.snapshot.load = "core self test: [OK]";
		// create load snapshot
		core.snapshot.load = "core modules to be loaded:";
		core.snapshot.load = JSON.stringify(core.core_loader.name);
		core.snapshot.load = "data modules to be loaded:";
		core.snapshot.load = JSON.stringify(core.data_loader.name);

		// boot
		change_state("boot");
	}
	function boot() {
		var tobe_booted = [];
		var not_booted = [];
		current_state = "boot";
		// check dependencies, push out inconsistent modules
		core.snapshot.boot = "on boot dependency check:";
		core.core_loader.module.forEach(function(module) {
			var dependencies_ok = true;
			for (var i=0; i < module[1].length; ++i) {
				if (-1 === core.core_loader.name.indexOf(module[1][i])) {
					if (dependencies_ok) {
						not_booted.push(module[0]);
						dependencies_ok = false;
					}
					core.snapshot.boot = "[ERROR]: module <" + module[0] + "> dependency <" + module[1][i] + "> not found";
				}
			}
			if (dependencies_ok) {
				tobe_booted.push(module[0]);
			}
		});
		core.snapshot.boot = "not boot: " + not_booted;
		core.snapshot.boot = "to be boot: " + tobe_booted;
		// boot core modules
		boot_core_modules(tobe_booted);
		//boot_data_modules([]);
		// go test
		change_state("test");
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
		core.snapshot.test = "test fail: "+test_fail;
		core.snapshot.test = "test OK: " + test_ok;
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
	function Loader(parent_obj) {
		//var parent_obj;
		//(object === undefined) ? parent_obj = glob.app : parent_obj= glob.app[object];
		var modules = [];
		var loaded = [];
		var not_loaded = [];
		var names = [];
		Object.defineProperty(this, "module", {
			set: load_module,
			get: function() { return modules; }
		});
		Object.defineProperty(this, "name", {
			set: function(d) { return null; },
			get: function() { return names; }
		});
		Object.defineProperty(this, "not_loaded", {
			set: function(d) { return null;},
			get: function() { return not_loaded; }
		});
		function load_module(module) {
			// already loaded or the name is occupied
			if (parent_obj.hasOwnProperty(module[0])) {
				return;
			}
			var dependencies_ok = true;
			for (var i=0; i < module[1].length; ++i) {
				if (-1 === Object.keys(parent_obj).indexOf(module[1][i])) {
					dependencies_ok = false;
				}
			}
			if (dependencies_ok) {
				parent_obj[module[0]] = new module[2]();
				core.snapshot.load = "module <"+ module[0] + "> loaded";
				names.push(module[0]);
				modules.push(module);
				// try to load others, who waits
				not_loaded.forEach(function(old_module) {
					load_module(old_module);
				});
			} else {
				not_loaded.push(module);
			}
		}
	}
	function Snapshot() {
		var load_data = [];
		var boot_data = [];
		var test_data = [];
		Object.defineProperty(this, "load", {
			set: function(data) { load_data.push(data); },
			get: function() {
				load_data.forEach(function(val) {
					console.log(val);
				});
			}
		});
		Object.defineProperty(this, "boot", {
			set: function(data) { boot_data.push(data); },
			get: function() {
				boot_data.forEach(function(val) {
					console.log(val);
				});
			}
		});
		Object.defineProperty(this, "test", {
			set: function(data) { test_data.push(data); },
			get: function() {
				test_data.forEach(function(val) {
					console.log(val);
				});
			}
		});
		Object.defineProperty(this, "all", {
			set: function(d) {return null},
			get: function() {
				load_data.forEach(function(val) {
					console.log(val);
				});
				boot_data.forEach(function(val) {
					console.log(val);
				});
				test_data.forEach(function(val) {
					console.log(val);
				});
			}
		});
	}
})(window);
