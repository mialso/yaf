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
	var tasks = {};

	// load module consrtuctor to app
	var core = glob.app.core;
	var log = new core.Logger("core-task");
	core.core_loader.module = module_data;

	// module constructor
	function Task_module() {
	}
	function Task(id, name) {
		this.id = id; 		// generic from module_name+>+module_id, or in general module.global_id
		this.owner = id;	// module.global_id of task owner, the module that initiated the task
		this.p_task = null;	// parent task
		this.name = name;	// interface name
		this.debug_log = [];
		this.state = "run";	// 'run' = in process; 'error', 'ok' = result
	};
	//function create_task([interface_name, method], id) {
	Task_module.prototype.create = function([interface_name, method]) {
		log.info = "create(): interface_data: ["+interface_name+"];";
		return function(data, parent_task) { 	// task run function
			var func = "run(): ";
			if (this.task && !(this.task instanceof Task)) {
				log.error = func+"\""+this.name+".task\" is not valid; this is generic property and should not be defined;";
				return;
			}
			// one task per module allowed, avoid multiple tasks
			if (this.task && this.task instanceof Task && "run" === this.task.state) {
				log.error = func+"\""+this.name+".task\" is already running: "+JSON.stringify(this.task)+";";
				return;
			}
			// create in-module task data storage to avoid suppling it throw arguments later
			this.task = new Task(this.global_id, interface_name);
			if (parent_task) {
				//this.task.owner = parent_task;
				this.task.p_task = parent_task;
			}
			log.info = "run(): <"+this.task.owner+">: ["+this.task.id+"]: \""+this.task.name+"\" start;";
			method.bind(this)(data);
			log.info = "run(): <"+this.task.owner+">: ["+this.task.id+"]: \""+this.task.name+"\" end;";

			check_task_result(this.task);
		};
	};
	// send task synchroniously to another module
	Task.prototype.run_sync = function(type, module, task_name, data) {
		log.info = "run_sync(): {"+this.owner+"}: \""+this.name+"\" start;";
		// early exit
		if (check_subtask_fail.bind(this)(type, module, task_name)) return;

		switch (type) {
			case "core":
				//core[module][task_name](data, this.owner);
				core[module][task_name](data, this);
				break;
			case "model":
				//glob.app[module][task_name](data, this.owner);
				glob.app[module][task_name](data, this);
				break;
		}
		log.info = "run_sync(): {"+this.owner+"}: \""+this.name+"\" end;";
	};
	Task.prototype.run_async = function(type, module, task_name, data) {
		log.info = "run_async(): {"+this.owner+"}: \""+this.name+"\" start;";
		// early exit
		if (check_subtask_fail.bind(this)(type, module, task_name)) return;

		switch (type) {
			case "core":
				//glob.setTimeout(core[module][task_name].bind(core[module]), 0, data, this.owner);
				glob.setTimeout(core[module][task_name].bind(core[module]), 0, data, this);
				break;
			case "model":
				//glob.setTimeout(glob.app[module][task_name].bind(glob.app[module]), 0, data, this.owner);
				glob.setTimeout(glob.app[module][task_name].bind(glob.app[module]), 0, data, this);
				break;
		}
		log.info = "run_async(): {"+this.owner+"}: \""+this.name+"\" end;";
	};
	// purpose: to store debug data and output it in error case
	Task.prototype.debug = function(string) {
		var header = Date.now()+" [DEBUG]: task ="+this.id+": ";
		var message = header + string;
		this.debug_log.push(message);
	}
	Task.prototype.error = function(string) {
		var header = Date.now()+" [ERROR]: task ="+this.id+": ";
		var message = header + string;
		this.debug_log.push(message);
		this.state = "error";
	}
	// service functions

	// context: no
	function success(task) {
		var parent_task_name = (task.p_task) ? task.p_task.name : "no parent";
		//log.info = "{"+this.task.id+"}: \""+this.task.name+"\" [OK];";
		//console.log("["+task.owner+"]: {"+task.id+"}: \""+task.name+"\" [OK];");
		console.log("["+parent_task_name+"]: {"+task.id+"}: \""+task.name+"\" [OK];");
	}
	// context: no
	function check_task_result(task) {
		switch(task.state) {
			case "run":
				// no error was reported, print ok
				task.state = "ok";
				success(task);
				break;
			case "error":
				// print error
				for (var i = 0; i < task.debug_log.length; ++i) {
					console.log(task.debug_log[i]);
				}
				break;
			default:
				// uknown or undefined state, error
				log.error = "check_task_result(): uknown task state ="+task.state+";";
				break;
		}
	}
	// context: task
	function check_subtask_fail(type, module, task_name) {
		var message = "check_subtask_fail(): <"+this.owner+">: ["+this.id+"]: \""+this.name+"\": ERROR: ";
		var prnt;
		if ("core" === type) {
			prnt = core;
			message = message + "\"core.";
		} else if ("model" === type) {
			prnt = glob.app;
			message = message + "\"glob.app.";
		} else {
			this.error(message+"type <"+type+"> is not valid");
			return true;
		}
		if (undefined === prnt[module] || !(prnt[module] instanceof Object)) {
			this.error(message+module+"\" is not valid ="+prnt[module]+";");
			return true;
		}
		if (undefined === prnt[module][task_name] || null === prnt[module][task_name] || !(prnt[module][task_name] instanceof Function)) {
			this.error(message+module+"."+task_name+"\" is not valid ="+prnt[module][task_name]+";");
			return true;
		}
		return false;
	}
	function test() {
		return 255;
	}
})(window);
