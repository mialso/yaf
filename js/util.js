;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;

	var module_data = [
		"util",
		["log"],
		Util,
		test
	];

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;
	var log = new core.Logger("util");

	function Util() {
		this.global_id = "util>model";

		this.check_string_fail = core.task.create(["check_string_fail", check_string_fail]);
	}
	function string_not_valid(string) {

	}
	function check_string_fail(task, variable, var_name, check_len) {
		var length = (check_len) ? check_len : 0;
		if (!variable || !("string" === typeof variable) || (length < config_string.length)) {
			// TODO too much data to be parsed, e.g. func name is absent
			return true;
		}
		return false;
	}

	function test() {
		// success return
		return 1;
	}
})(window);
