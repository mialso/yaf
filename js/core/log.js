;(function(glob) {
	
	// define static data
	var module_data = {
		name: "log"
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.mock = {};
		glob.app.test = {};
	}
	// create module resources
	init_log();

function test(app) {
	log_test(app, "test message");
	log_test(app, "");
	log_test(app, null);
	log_test(app, new Object);
	log_test(app, {});
	log_test(app, undefined);
	log_test(null, "message");
	log_test("app", "message");
}


	// init boot on container ready event

function init_log() {
	var name = module_data.name;
	if (!glob.console) {
		glob.app[name] = false;
		return;
	}
	Object.defineProperty(glob.app, name, {
		set: function(message) {
			if ("test" == this.mode) {
				this.mock[name] = "[" + this.name + "]: " + message;
			} else {
				glob.console.log("[" + this.name + "]: " + message);
			}
		},
		get: function() { return null; }
	});
	glob.app.test.log = test;
}

function log_test(app, message) {
	//console.log("typeof app is %s, app is %s", typeof app, app);
	//if (app === undefined || app === null || !app.mock) {
	if (!app || !app.mock) {
		console.log("[ERROR]: console_test: app is \"%s\"", app);
		return;
	}
	// TODO refactor mode
	var clean_up = false;
	if ("test" !== app.mode) {
		app.mode = "test";
		clean_up = true;
	}
	// init mock data
	var success_message = "[" + app.name + "]: " + message;
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
})(this);
