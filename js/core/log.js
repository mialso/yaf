;(function(glob) {
	
	// define static data
	var module_data = {
		name: "log"
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	var mock = {};
	var test;
	// create module resources
	//init_log();
	glob.app.module["log"] = Log;

	// module constructor to be called by core
	function Log() {
		Object.defineProperty(this, "info", {
			set: function(message_data) {
				// early exit on wrong args
				if (!Array.isArray(message_data) || message_data.length < 2) {
					// TODO implement core error???
					console.log("[ERROR]: console_test: message is \"%s\"", message_data);
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
	}

	function test(app) {
		log_test(app, ["module_one", "test message"]);
		log_test(app, ["", ""]);
		log_test(app, [null, "some message"]);
		log_test(app, new Object);
		log_test(app, {});
		log_test(app, undefined);
		log_test(null, "message");
		log_test("app", "message");
	}
	function log_test(app, message) {
		if (!app || !app.mock) {
			console.log("[ERROR]: console_test: app is \"%s\"", app);
			return;
		}
		if (!Array.isArray(message) || message.length < 2) {
			console.log("[ERROR]: console_test: message is \"%s\"", message);
			return;
		}
		// TODO refactor mode
		var clean_up = false;
		if ("test" !== app.mode) {
			app.mode = "test";
			clean_up = true;
		}
		// init mock data
		var success_message = "[" + message[0] + "]: " + message[1];
		if (app.mock.log === undefined) {
			Object.defineProperty(app.mock, "log", {
				set: function(message) {
					this.result = message;
				},
				get: function() {
					return null;
				}
			});
		}
		// perform test
		app.log = message;
		// check result
		if (success_message === app.mock.result) {
			console.log("[SUCCESS]: console: test success");
		} else {
			console.log("[FAIL]: console: test fail: success = \"%s\" result = \"%s\"", success_message, app.mock.result);
		}
		if (clean_up) {
			app.mode = "normal";
		}
	}
})(window);
