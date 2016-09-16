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
		this.id = id+"@"+name; 		// unique task identifier, human readable and meaningfull
		this.p_task = [];	 		// parent task id's storage
		this.name = name;			// interface name
		this.debug_log = [];		// to store debug output from jobs(module/model functions)
		this.state = "run";			// 'run', 'error', 'ok', 'done'
		this.result = "";
	};
	/*
	* purpose: to create model instance interface, to be executed 'inside' the
	* ->new Task. All Task functionality will be gained to interface method to
	* ->perform debugging, error handling and subtask execution
	*/
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
				//log.error = func+"\""+this.global_id+".task{"+this.task.name+"}\" is already running: "+JSON.stringify(this.task)+";";
				log.error = func+"\""+this.global_id+".task{"+this.task.name+"}\" is already running, p_task =\""+parent_task+"; interface =\""+interface_name+"\";";
				return;
			}
			// create in-module task data storage to avoid suppling it throw arguments later
			this.task = new Task(this.global_id, interface_name);
			if (parent_task) {
				this.task.p_task.push(parent_task);
			}
			// debug input data
			this.task.debug("[RUN]: {"+this.task.name+"}: data ="+JSON.stringify(data)+";");
			method.call(this, data);
			log.info = "run(): ["+this.task.id+"]: end;";

			check_task_result(this.task);
		};
	};
	/*
	* purpose: to run subtask in sync manner, which means that subtask execution
	* ->will procedd immediately and current task will wait until subtask ends
	*/
	Task.prototype.run_sync = function(type, module, task_name, data) {
		log.info = "run_sync(): \""+this.name+"\" start;";
		// early exit
		if (subtask_is_not_valid.call(this, type, module, task_name)) return;

		switch (type) {
			case "object":
				module[task_name](data, this.id);
				break;
			case "core":
				core[module][task_name](data, this.id);
				break;
			case "model":
				glob.app[module][task_name](data, this.id);
				break;
		}
		log.info = "run_sync(): \""+this.name+"\" end;";
	};
	/*
	* purpose: to run subtask in async manner, which means that subtask execution
	* ->be suspended until current task ends
	*/
	Task.prototype.run_async = function(type, module, task_name, data) {
		// early exit
		if (subtask_is_not_valid.call(this, type, module, task_name)) return;

		switch (type) {
			case "object":
				glob.setTimeout(module[task_name].bind(module), 0, data, this.id);
				break;
			case "core":
				glob.setTimeout(core[module][task_name].bind(core[module]), 0, data, this.id);
				break;
			case "model":
				glob.setTimeout(glob.app[module][task_name].bind(glob.app[module]), 0, data, this.id);
				break;
		}
	};
	/*
	* purpose: to validate string and set error message in case string is invalid
	*/
	Task.prototype.string_is_not_valid = function(func, var_name, string) {
		if (!string || !("string" === typeof string) || (1 > string.length)) {
			this.error(func+var_name+" is not valid ="+JSON.stringify(string)+";");
			return true;
		}
		return false;
	}
	/*
	* purpose: to store debug data and output it in error case
	*/
	Task.prototype.debug = function(string) {
		var header = Date.now()+" [DEBUG]: task ="+this.id+": ";
		var message = header + string;
		this.debug_log.push(message);
	}
	/*
	* purpose: to store error data and mark state as error ot be handled by result
	*/
	Task.prototype.error = function(string) {
		var header = Date.now()+" [ERROR]: task ="+this.id+": ";
		var message = header + string;
		this.debug_log.push(message);
		this.state = "error";
	}
	// service functions

	/*
	* purpose: to output success message
	* context: no
	* arguments: Task
	*/
	function success(task) {
		var parent_task_name = task.p_task.join("->");
		console.log("["+parent_task_name+"]: {"+task.id+"}: "+task.result+": [OK];");
	}
	/*
	* purpose: to handle task results and mark state as "done" to let new task be started
	* context: no
	* arguments: Task
	*/
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
		task.state = "done";
	}
	/*
	* purpose: to validate subtask
	* context: Task
	* return: false in case no errors found, true overwise
	*/
	function subtask_is_not_valid(type, module, task_name) {
		var message = "subtask_is_not_valid(): ["+this.id+"]: ERROR: ";
		var prnt;
		// validate type
		if ("core" === type) {
			prnt = core[module];
			message = message + "\"core."+module+"\"";
		} else if ("model" === type) {
			prnt = glob.app[module];
			message = message + "\"glob.app."+module+"\"";
		} else if ("object" === type) {
			prnt = module;
			message = message + "\""+module+"\"";
		} else {
			this.error(message+"type <"+type+"> is not valid");
			return true;
		}
		// validate module
		if ((undefined === prnt) || (null === prnt)) {
			this.error(message+" is not valid ="+prnt+";");
			return true;
		}
		// validate task
		if (undefined === prnt[task_name] || null === prnt[task_name] || !(prnt[task_name] instanceof Function)) {
			this.error(message+"."+task_name+"\" is not valid ="+prnt[task_name]+";");
			return true;
		}
		return false;
	}

	function test() {
		return 255;
	}
})(window);
