;(function(glob) {
	
	// define static data
	var app_data = {
		name: "vs_pm",
		mode: "normal"
	};
	// create app resources
	init_app(glob, app_data);

	// init boot on container ready event
	glob.onload = function() {
		this.app.log = "i am ready!";
		/*
		for (key in Object.keys(this.app.test)) {
			this.app.test[key](this.app);
		}
		*/
		this.app.test.log(this.app);
	}

	function init_app(glob, data) {
		if (!glob.app) {
			glob.app = {};
			glob.app.mock = {};
			glob.app.test = {};
		}
		glob.app.core = {
			name: data.name,
			mode: data.mode,
		};
	}

})(this);


