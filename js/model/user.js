;(function(glob) {
	// early exit
	if (!glob.app && !glob.app.core) return;	

	// init static data
	var module_data = [
		"user",
		["err", "log", "ui"],
		User,
		test
	]
	var default_user = {
		name: "guest",
		UI: ["header", "main", "footer"]
	}
	var core = glob.app.core;

	// load module
	core.data_loader.module = module_data;
	function User() {
	}
	
	function test() {
		return 1;
	}
})(window);
