;(function(glob) {
	
	// define static data
	var module_data = {
		name: "core"
	};
	if (!glob.app) {
		glob.app = {};
		glob.app.module = {};
	}
	// create app resources
	glob.app.module["core"] = Core;

	// module constructor
	function Core() {
		console.log("Core constructor");
		Object.defineProperty(this, "module", {
			set: function(module_name) {
				console.log("Core: new module: %s", module_name);
				glob.app[module_name] = new glob.app.module[module_name]();
				delete glob.app.module[module_name];
			},
			get: function() { return null; }
		})
	}

})(window);


