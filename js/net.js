;(function(glob) {
	"use strict";
	// early exit
	if (!glob.app || !glob.app.core) return;

	var module_data = [
		"net",
		["tst", "task"],
		Net,
		test
	];

	// load module consrtuctor to app
	var core = glob.app.core;
	core.core_loader.module = module_data;

	function Net() {
		this.global_id = "net>model";

		this.req_get = core.task.create(["req_get", get_req]);
		this.req_post = core.task.create(["req_post", post_req]);
	}

	function get_req([uri, handler]) {
		this.task.debug("get_req(): uri = "+uri+", handler is "+handler+";");
		send_request.bind(this)("GET", uri, handler, null);
	}

	function post_req([uri, handler, data]) {
		this.task.debug("post_req(): uri = "+uri+", handler is "+handler+", data = "+data+";");
		send_request.bind(this)("POST", uri, handler, data);
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
			this.task.error("send_request(): req is invalid ="+req+";");
			return;
		}

	    req.open(method, uri);
		if (data) {
				console.log("POST req data =%s", data);
			var blob = new Blob([data], {type: "text"});
			req.send(blob);
		} else {
			req.send();
		}
		//data ? req.send(data) : req.send();

	    req.onreadystatechange = (function() {
	        if (req.readyState === XMLHttpRequest.DONE) {
	            if (req.status === 200) {
					this.task.result = "send_request(): success; req.response is ="+req.responseText+";";
	                handler(req.responseText);
	            } else {
					this.task.error("send_request(): req.onreadystatechange req.status is "+req.status+", uri ="+uri+";");
					return;
	            }
	        }
	    }).bind(this);
	}
	function test() {
		return 255;
	}
})(window);
