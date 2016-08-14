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

	function Net() {
		this.get_req = get_req;
		this.post_req = post_req;
	}

	function test() {
		// success return
		return 1;
	}
	function get_req(uri, handler) {
		send_request("GET", uri, handler, null);
	}

	function post_req(uri, handler, data) {
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
			core.log.info = ["net", "unable to create request to " + uri];
			return;
		}

	    req.open(method, uri);
		data ? req.send(data) : req.send();

	    req.onreadystatechange = function() {
	        if (req.readyState === XMLHttpRequest.DONE) {
	            if (req.status === 200) {
	                handler(req.responseText);
	            } else {
	                core.log.info = ["net", "request receive data error from " + uri];
	            }
	        }
	    };
	}
})(window);
