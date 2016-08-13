;(function(glob) {
	// early exit
	if (!glob.app && !glob.app.core) return;	

	// init static data
	var module_data = {
		name: "user",
		dependency: ["err", "log", "ui"]
	}
	var default_user = {
		name: "guest",
		UI: ["header", "main", "footer"]
	}
	function User() {
		this.self_test = test;
		this.dependencies = module_data.dependency;
	}
	
	function test() {
		return 1;
	}
})(window);
