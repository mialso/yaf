;(function(glob) {
	
	// define static data
	var app = new Object;
	app.name = "vs_pm";
	app.log = new Object;
	// TODO log object, like syslog: debug..emerg + facilities
	var app_name = "vs_pm";
	// create app resources
	init_app(glob, app_name);

	init_console(glob);


	// init boot on container ready event
	glob.onload = function() {
		this.app.console = "i am ready!";
	}

})(this);

function init_app(glob, name) {
	if (!glob.app) {
		glob.app = new Object;
		glob.app.name = name;
	}
}
function init_console(glob) {
	if (!glob.console) {
		this.console = false;
		return;
	}
	Object.defineProperty(glob.app, "console", {
		set: function(message) {
			return glob.console.log("[" + this.name + "]: " + message);
		}
	});
}
