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
	}

	// TODO move test common functionality to tst module
	function test() {
		var success = 0;
		mock.run = true;
		success = info_test(["module_one", "test message"]);
		success = info_test(["", ""]);
		success = info_test([null, "some message"]);
		mock.run = false;
		// TODO unsuccess cases
		return 1;
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
			return 1;
		} else {
			core.err.test = "[FAIL]: <log>: info_test: expected = "+success_message+"; current = "+ mock.result;
			return 0;
		}
	}
})(window);
