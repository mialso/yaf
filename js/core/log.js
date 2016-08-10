;(function(glob) {
	
	// define static data
	var module_data = {
		name: "log",
		dependency: ["err", "tst"]
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	var mock = {};
	var app = glob.app;
	//var test;

	// create module resources
	// register constructor to load module
	app.module["log"] = Log;

	// module constructor to be called by core
	function Log() {
		console.log("Log constructor");
		Object.defineProperty(this, "info", {
			set: function(message_data) {
				// early exit on wrong args
				if (!Array.isArray(message_data) || message_data.length < 2) {
					// TODO implement core error???
					console.log("[ERROR]: log.info: message is \"%s\"", message_data);
					return;
				}
				// main logic
				var result_message = "[" + message_data[0] + "]: " + message_data[1];
				// TODO output to mock may be configurable
				mock["log"] = result_message;
				glob.console.log(result_message);
			},
			get: function() { return null; }
		});
		this.test = test;
		this.dependencies = module_data.dependency;
	}

	function test() {
		var success = 0;
		success = log_info_test(["module_one", "test message"]);
		success = log_info_test(["", ""]);
		success = log_info_test([null, "some message"]);
		// TODO unsuccess cases
		return 1;
	}
	function log_info_test(message) {
		if (!Array.isArray(message) || message.length < 2) {
			console.log("[ERROR]: console_test: message is \"%s\"", message);
			return;
		}
		// init mock data
		var success_message = "[" + message[0] + "]: " + message[1];
		if (mock.log === undefined) {
			Object.defineProperty(mock, "log", {
				set: function(message) {
					this.result = message;
				},
				get: function() {
					return null;
				}
			});
		}
		// perform test
		app.log.info = message;
		// check result
		if (success_message === mock.result) {
			console.log("[SUCCESS]: log.info: test success");
			return 1;
		} else {
			console.log("[FAIL]: log: test fail: success = \"%s\" result = \"%s\"", success_message, mock.result);
			return 0;
		}
	}
})(window);
