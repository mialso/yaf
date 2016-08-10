;(function(glob) {
	
	// define static data
	var app_data = {
		name: "vs_pm",
		mode: "normal"
	};
	// create app resources
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	

	// init boot on container ready event
	glob.onload = function() {
		this.app.core = new this.app.module.core();
		//delete this.app.module.core;
		console.log("modules = %s", Object.keys(this.app.module));
		console.log("modules = %s", Object.getOwnPropertyNames(this.app.module));
		//for (key in Object.keys(this.app.module)) {
		Object.keys(this.app.module).forEach(function(val, ind, arr) {
			this.app.core.module = val;
		});
		/*
		for (key in Object.getOwnPropertyNames(this.app.module)) {
			console.log("the key is %s and equal to %s", typeof key, key);
			console.log(key);
			//this.app.core.module = key;
		}
		*/
		//this.app.log.info = ["app","i am ready!"];
		/*
		for (key in Object.keys(this.app.test)) {
			this.app.test[key](this.app);
		}
		*/
		//this.app.test.log(this.app);
	}

})(window);


