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
		this.id = name+":"+id;
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
		return function(data, parent_task) { 	// task run function
			if (parent_task) {
				this.task.owner = parent_task;
			} else {
				this.task.owner = this.task.id;
			}
			this.task.name = name;
			this.task.log.info = "run(): <"+this.task.owner+">: \""+this.task.name+"\" start;";
			method.bind(this)(data);
			this.task.log.info = "run(): <"+this.task.owner+">: \""+this.task.name+"\" end;";
		};
	}
	// send task synchroniously to another module
	Task.prototype.run_sync = function(type, module, task_name, data) {
		this.log.info = "run_sync(): <"+this.owner+">: \""+this.name+"\" start;";
		//this.log.info = "run_sync(): data ="+JSON.stringify(arguments)+"; this ="+JSON.stringify(this)+";";
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
		this.log.info = "run_sync(): <"+this.owner+">: \""+this.name+"\" end;";
		//this.log.info = "run_sync(): end; this ="+JSON.stringify(this)+";";
	}
	Task.prototype.run_async = function(type, module, task_name, data) {
		this.log.info = "run_async(): <"+this.owner+">: \""+this.name+"\" start;";
		//this.log.info = "run_sync(): data ="+JSON.stringify(arguments)+"; this ="+JSON.stringify(this)+";";
		switch (type) {
			case "core":
				glob.setTimeout(core[module][task_name].bind(core[module]), 0, data);
				break;
			case "model":
				glob.setTimeout(glob.app[module][task_name].bind(glob.app[module]), 0, data);
				break;
			default:
				// TODO error
				break;
		}
		this.log.info = "run_async(): <"+this.owner+">: \""+this.name+"\" end;";
		//this.log.info = "run_async(): end; this ="+JSON.stringify(this)+";";
	}
	Task.prototype.success = function() {
		this.log.info = "<"+this.id+">: \""+this.name+"\" [OK];";
	}
	function test() {
		return 255;
	}
})(window);
