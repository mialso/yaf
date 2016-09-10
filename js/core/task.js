;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;
	
	// define static data
	var module_data = [
		"task",
		["log"],
		Task_module,
		test
	];
	// create app resources

	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("core-task");
	core.core_loader.module = module_data;

	// module constructor
	function Task_module() {
		this.Task = Task;
	}
	function Task([name, id]) {
		this.owner = name+":"+id;
		this.name = "default";
		this.log = log;
		//this.log = new core.log.Task(); 
	};
	Task.prototype.create = function([name, method]) {
		if (!this.log) {
			console.log("[TASK]: create(): ERROR: \"this.log\" is <"+this.log+">; task ="+JSON.stringify(this)+";"); 
			return;
		}
		this.log.info = "create(): data: name ="+name+"; method ="+method.name+"; this ="+JSON.stringify(this)+";";
		var slf = this;
		//var slf = this;
		return function(data) { 	// task run function
			//slf.task.name = name;
			var new_slf = this;
			this.task.name = name;
			//method.bind(slf)(data);
			method.bind(this)(data);
			//slf.log.info = "create(): end; this ="+JSON.stringify(this)+";";
			this.task.log.info = "create(): end; slf ="+JSON.stringify(slf)+";";
			this.task.log.info = "create(): end; new_slf ="+JSON.stringify(new_slf)+";";
			this.task.log.info = "create(): end; this ="+JSON.stringify(this)+";";
			//this.task.log.info = "create(): end; this ="+JSON.stringify(this)+";";
		};
	}
	function run_task(data) {
		this.task.name = name;
		method.bind(this)(data);
		this.log.info = "create(): end; this ="+JSON.stringify(this)+";";
	};
		
	// send task synchroniously to another module
	Task.prototype.send_sync = function(type, module, task_name, data) {
		this.log.info = "send_sync(): data ="+JSON.stringify(arguments)+"; this ="+JSON.stringify(this)+";";
		switch (type) {
			case "core":
				core[module][task_name](data);
				break;
			case "model":
				glob.app[module][task_name](data);
				break;
			default:
				// TODO error
				break;
		}
		this.log.info = "send_sync(): end; this ="+JSON.stringify(this)+";";
	}
	function test() {
		return 255;
	}
})(window);
