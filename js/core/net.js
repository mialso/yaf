;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;

	var module_data = [
		"net",
		["err", "log", "tst"],
		Net,
		test
	];

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;
	var log = new core.Logger("net");

	function Net() {
		Object.defineProperty(this, "log", {
			set: function(d) { return null; },
			get: function() {return log;}
		});
		this.req_get = core.task.create(["req_get", get_req]);
/*
		Object.defineProperty(this, "req_get", {
			set: get_req,
			get: function() { return true; }
		});
*/
		Object.defineProperty(this, "req_post", {
			set: post_req,
			get: function() { return null; }
		});
		this.get_req = get_req;
		this.post_req = post_req;
	}

	function test() {
		// success return
		return 1;
	}
	function get_req([uri, handler]) {
		log.info = "get_req(): uri = "+uri+", handler is "+handler;
		send_request("GET", uri, handler, null);
	}

	function post_req([uri, handler, data]) {
		log.info = "post_req(): uri = "+uri+", handler is "+handler+", data = "+data;
		send_request("POST", uri, handler, data);
	}
	function send_request(method, uri, handler, data) {
	    var req;
	    if (glob.XMLHttpRequest) {
	        req = new XMLHttpRequest();
	    }
	    else if (glob.ActiveXObject) {
	        req = new ActiveXObject("Microsoft.XMLHTTP");
	    }

	    if (!req) {
			log.error = "send_request(): req is "+req;
			return;
		}

	    req.open(method, uri);
		data ? req.send(data) : req.send();

	    req.onreadystatechange = function() {
	        if (req.readyState === XMLHttpRequest.DONE) {
	            if (req.status === 200) {
	                handler(req.responseText);
	            } else {
					log.error = "send_request(): req.onreadystatechange req.status is "+req.status+", uri ="+uri;
	            }
	        }
	    };
	}
})(window);
