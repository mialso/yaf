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
	var mock = {run: false};
	var core = glob.app.core;

	// create module resources

	// load module consrtuctor to app
	core.core_loader.module = module_data;

	// module constructor to be called by core
	function Log() {
		Object.defineProperty(this, "info", {
			set: function(message_data) {
				// early exit on wrong args
				if (!Array.isArray(message_data) || message_data.length < 2) {
					core.err.internal = "<log>: Log(): info.message_data is not Array, but %s", message_data;
					return;
				}
				// main logic
				var result_message = "[" + message_data[0] + "]: " + message_data[1];
				// TODO output to mock may be configurable
				if (mock.run) mock["log"] = result_message;
				else glob.console.log(result_message);
			},
			get: function() { return null; }
		});
		this.Logger = Logger;
	}
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

	// TODO move test common functionality to tst module
	function test() {
		var success = 255;
		mock.run = true;
		success = info_test(["module_one", "test message"]);
		success = info_test(["", ""]);
		success = info_test([null, "some message"]);
		mock.run = false;
		// TODO unsuccess cases
		return success;
	}
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
})(window);
