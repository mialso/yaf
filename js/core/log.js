;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;

	// define static data
	var module_data = [
		"log",
		["err", "tst"],
		Log,
		test
	];
	//var mock = {run: false};
	var models_to_debug = ["", ""];
	var instances_to_debug = [""];
	var debug_errors = true;
	var model_debug = [];
	var core = glob.app.core;

	// create module resources

	// load module consrtuctor to app
	core.core_loader.module = module_data;

	// module constructor to be called by core
	function Log() {
		this.Model = Model_logger;
	}
	function Model_logger([model, instance]) {
		// storage
		var error_log = [];
		var info_log = [];
		var warn_log = [];
		// headers data
		var model_name = model.toUpperCase();
		var instance_name = instance;
		var headers = [model_name, instance_name];
		// debug flag
		var debug_model = (-1 !== models_to_debug.indexOf(model)) ? true : false;
		var debug_instance = (-1 !== instances_to_debug.indexOf(instance)) ? true : false;
		// interface
		Object.defineProperty(this, "error", {
			set: function(data) {
				var message = create_message("ERROR", headers, data);
				error_log.push(message);
				if (debug_errors) {
					console.log(message);
				}
			},
			get: function() {
				if (0 === error_log.length) {
					var message = create_message("LOG", headers, "ERROR: empty");
					console.log(message);
					return;
				}
				for (var i = 0; i < error_log.length; ++i) {
					console.log(error_log[i]);
				}
			}
		});
		Object.defineProperty(this, "warn", {
			set: function(data) {
				var message = create_message("WARN", headers, data);
				warn_log.push(message);
				//if (-1 !== debug || "off" !== core_debug[0]) {
				if (debug_model || debug_instance) {
					console.log(message);
				}
			},
			get: function() {
				if (0 === error_log.length) {
					var message = create_message("LOG", headers, "WARN: empty");
					return;
				}
				for (var i = 0; i < error_log.length; ++i) {
					console.log(error_log[i]);
				}
			}
		});
		Object.defineProperty(this, "info", {
			set: function(data) {
				var message = create_message("INFO", headers, data);
				info_log.push(message);
				//if (-1 !== debug || "all" === core_debug[0]) {
				if (debug_model || debug_instance) {
					console.log(message);
				}
			},
			get: function() {
				if (0 === info_log.length) {
					var message = create_message("LOG", headers, "INFO: empty");
					return;
				}
				for (var i = 0; i < info_log.length; ++i) {
					console.log(info_log[i]);
				}
			}
		});
	}
	function create_message(type, headers, data) {
		// TODO refactor to store time here and possibly move other appends to 'get'
		var string = "["+type+"]: <"+headers[0]+">: {"+headers[1]+"}: " + data+";";
		return string;
	}
/*
	function Logger(name) {
		var error_log = [];
		var info_log = [];
		var module_name = name.toUpperCase();
		Object.defineProperty(this, "error", {
			set: function(data) {
				var message = "[ERROR]: <"+module_name+">: " + data;
				error_log.push(message);
			},
			get: function() {
				if (0 === error_log.length) {
					console.log("[INFO]: <"+module_name+">: error_log is empty");
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
			},
			get: function() {
				for (var i = 0; i < info_log.length; ++i) {
					console.log(info_log[i]);
				}
			}
		});
	}
*/

	// TODO move test common functionality to tst module
	function test() {
		var success = 255;
/*
		mock.run = true;
		success = info_test(["module_one", "test message"]);
		success = info_test(["", ""]);
		success = info_test([null, "some message"]);
		mock.run = false;
		// TODO unsuccess cases
*/
		return success;
	}
/*
	function info_test(message) {
		if (!Array.isArray(message) || message.length < 2) {
			core.err.test = "[ERROR]: console_test: message is "+ message;
			return;
		}
		// init mock data
		var success_message = "[" + message[0] + "]: " + message[1];
		if (mock.log === undefined) {
			Object.defineProperty(mock, "log", {
				set: function(message) {
					this.result = message;
				},
				get: function() { return null;}
			});
		}
		// perform test
		core.log.info = message;
		// check result
		if (success_message === mock.result) {
			// TODO pass some data to tst about test
			return 0;
		} else {
			core.err.test = "[FAIL]: <log>: info_test: expected = "+success_message+"; current = "+ mock.result;
			return 1;
		}
	}
*/
})(window);
