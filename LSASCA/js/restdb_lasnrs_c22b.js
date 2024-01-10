
/* 
 * RestDB.io (c) JavaScript API
 * Generated for database: https://lasnrs-c22b.restdb.io
 * Date: Wed Jan 10 2024 11:50:53 GMT+0000 (UTC)
 */
 
var restdb_c22b = (function(apikey, opt) {
	var _self = this;
	var _es = null;
	var _pubsub_listeners = [];
	opt = opt || {}
	this.logging = opt.logging;
	this._url = opt.url || "https://lasnrs-c22b.restdb.io"; 
	this._apikey = apikey;
	this._jwt = opt.jwt || false;
	this.evtsrc = null;
	var _lastping = new Date();
	var _pingdiff = 0;
	var _keepalivedelay = opt._keepalivedelay || 20000;
	var _keepalivediff = opt._keepalivediff || 25000;


	// logging
	var _log = function() {
		if (_self.logging === true) {
			console.log(arguments);
		}
	}
	// keep alive
	setInterval(function(){
		var now = new Date();
		_pingdiff = now.getTime() - _lastping.getTime();
		if (_pingdiff > _keepalivediff) {
			_conn();
			$(document).trigger("lasnrsc22b_reconnect_event");
		}
	}, _keepalivedelay);

	var _isFunction = function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}

	// reatime global events
	var _on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for all realtime events
		switch (evt) {
			case "CONNECT":
				$(document).on("lasnrsc22b_connect_event",function(e, data){
					_log("Connect");
					if (callback){callback(null, null);}
				});
				break;
			case "DISCONNECT":
				$(document).on("lasnrsc22b_disconnect_event",function(e, data){
					_log("Disconnect");
					if (callback){callback(null, null);}
				});
				break;
			case "RECONNECT":
				$(document).on("lasnrsc22b_reconnect_event",function(e, data){
					_log("Reconnect");
					if (callback){callback(null, null);}
				});
				break;
			case "POST":
				$(document).on("lasnrsc22b_post_data_event",function(e, data){
					_log("Post");
					if (callback){callback(null, data);}
				});
				break;
			case "PUT":
				$(document).on("lasnrsc22b_put_data_event",function(e, data){
					_log("Put");
					if (callback){callback(null, data);}
				});
				break;
			case "DELETE":
				$(document).on("lasnrsc22b_delete_data_event",function(e, data){
					_log("Delete");
					if (callback){callback(null, data);}
				});
				break;
			default:
				$(document).on("lasnrsc22b_publish_data_event",function(e, data){
					_log("Publish");
					if (callback && data.event === evt){callback(null, data);}
				});
				break;
		}
	};
	
	// connect
	
	var _conn = function() {
		if (!opt.realtime) {return};

		_log('Connect...',_self._url);
		if (_es !== null) {
			_es.close();
		}
		if (opt.jwt) {
			_es = new EventSource(_self._url+"/realtime?jwt="+apikey+"&rt-apikey="+(opt['realtime-api-key'] || apikey));
		} else {
			_es = new EventSource(_self._url+"/realtime?apikey="+apikey);	
		}
		
		_es.addEventListener("open", function(e) {
			_log("Realtime open");
			$(document).trigger("lasnrsc22b_connect_event");
		});
		_es.addEventListener('ping', function(e){
			_lastping = new Date(e.data);
		},false);
		_es.addEventListener('put', function(e) {
			var eo = JSON.parse(e.data);
			_log("PUT evt ", eo);
			$(document).trigger("lasnrsc22b_put_data_event", eo);
		}, false);
		_es.addEventListener('post', function(e) {
			var eo = JSON.parse(e.data);
			_log("POST evt ", eo);
			$(document).trigger("lasnrsc22b_post_data_event", eo);
		}, false);
		_es.addEventListener('delete', function(e) {
			var eo = JSON.parse(e.data);
			_log("DELETE evt ", eo);
			$(document).trigger("lasnrsc22b_delete_data_event", eo);
		}, false);
		_es.addEventListener('publish', function(e) {
			var eo = JSON.parse(e.data);
			_log("DELETE evt ", eo);
			$(document).trigger("lasnrsc22b_publish_data_event", eo);
		}, false);
		_es.addEventListener("error", function(e) {
			_log('Connect error ...',e);
			var txt;
			$(document).trigger("lasnrsc22b_disconnect_event");  
			switch(e.target.readyState){  
			case EventSource.CONNECTING:  
				_log('Reconnecting...');
				break;  
			case EventSource.CLOSED:
				_log('Closed...');
				setTimeout(function(){
					_conn();
				}, opt.reconnectdelay || 5000);
				
				break;  
			}
		});
	}
	if (opt.realtime){
		_conn(this);
	}
	// global ajax
	var _ajax = function(opt, callback) {
		var useAsync = true;
		if($.ajaxSetup().async===false){
			useAsync = false;
		}
		if (opt.async != undefined){
			useAsync = opt.async;
		}
		_log("Async is ",useAsync);
		var ajx = {
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			tryCount : 0,
			retryLimit : 3,
			retryDelay: 10000,
			"async": useAsync,
			"crossDomain": true,
			"headers": {
				"content-type": "application/json",
				"x-apikey": _self._apikey
			},
			"processData": false,
			success : function(json, status, xhr) {
				if (callback){
					callback(null, json, status, xhr);
				}
			},
			error : function(xhr, textStatus, errorThrown ) {
				if ($.inArray(textStatus, ['timeout', 'abort', 'error']) > -1) {
					if (xhr.responseJSON && xhr.responseJSON.message && xhr.responseJSON.message !== '"ValidationError"'){
						if (callback){
							callback(xhr, null);
						}
						return;
					}
					//if (textStatus == 'timeout') {
					this.tryCount++;
					if (opt.retry && this.tryCount <= this.retryLimit) {
						//try again
						var that = this;
						setTimeout(function(){
							$.ajax(that);	
						}, this.retryDelay);
						
						return;
					} else {
						if (callback){
							callback(xhr, null);
						}
					}            
					return;
				}
				if (xhr.status == 500) {
					if (callback){
						callback(xhr, null);
					}
				} else {
					if (callback){
						callback(xhr, null);
					}
				}
			}
		};
		ajx.url = opt.url;
		ajx.type = opt.type;
		if (opt.data) {
			ajx.data = opt.data;
		}
		if (_self._jwt) {
			ajx.headers["Authorization"] = "Bearer " + _self._apikey;
			delete ajx.headers["x-apikey"];
		} else {
			_log("No JWT option ", _self._jwt);
		}
		$.ajax(ajx);
	}

	// Helper
	var _json2obj = function(json, obj) {
		if (json && json['_id']) {
			obj['_id'] = json['_id'];
		}
		if (json && json['_created']) {
			obj['_created'] = json['_created'];
		}
		if (json && json['_createdby']) {
			obj['_createdby'] = json['_createdby'];
		}
		if (json && json['_changed']) {
			obj['_changed'] = json['_changed'];
		}
		if (json && json['_changedby']) {
			obj['_changedby'] = json['_changedby'];
		}
		if (json && json['_version']) {
			obj['_version'] = json['_version'];
		}
	}

	// Publish/Subscribe events
	/*
	var _subscribe = function(topic, callback) {
		
		_es.addEventListener(topic, function(e) {
			var eo = JSON.parse(e.data);
			console.log(eo);
			callback(null, eo);
		});
	}
	*/
	var _publish = function(topic, payload, callback) {
		var msg = {"event": topic, "data": payload};
		var url = _self._url + "/realtime";
		var ajxopt = {url : url, type : 'POST', data: JSON.stringify(msg), retry: true};
		if (!callback) {
			ajxopt.async = false;
		}
		_ajax(ajxopt, function(err, res){
			if (!err){
				_log("Published ok ", res);				
				if (callback){
					callback(err, res);
				}
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	}
	
	// Collection class
	var systemjobs = function(json) {
		_json2obj(json, this);
					this['script'] = json['script'];
					this['active'] = json['active'];
					this['description'] = json['description'];
					this['crontab'] = json['crontab'];
	};
	

	systemjobs.prototype = {
		toString: function() {
			return "systemjobs";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/system_jobs";
			var json = {};
			json['script'] = this['script'];
			json['active'] = this['active'];
			json['description'] = this['description'];
			json['crontab'] = this['crontab'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['script'] = res['script'];
					_that['active'] = res['active'];
					_that['description'] = res['description'];
					_that['crontab'] = res['crontab'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/system_jobs/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/system_jobs/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['script'] = res['script'];
							_that['active'] = res['active'];
							_that['description'] = res['description'];
							_that['crontab'] = res['crontab'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("system_jobs" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("system_jobs this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	systemjobs.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/system_jobs?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new systemjobs(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	systemjobs.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/system_jobs/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new systemjobs(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	systemjobs.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("system_jobs" === data.collection && evt === "PUT"){
				_log("system_jobs Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("system_jobs" === data.collection && evt === "POST"){
				_log("system_jobs Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("system_jobs" === data.collection && evt === "DELETE"){
				_log("system_jobs Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};
	var systemlog = function(json) {
		_json2obj(json, this);
					this['status'] = json['status'];
					this['logstring'] = json['logstring'];
	};
	

	systemlog.prototype = {
		toString: function() {
			return "systemlog";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/system_log";
			var json = {};
			json['status'] = this['status'];
			json['logstring'] = this['logstring'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['status'] = res['status'];
					_that['logstring'] = res['logstring'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/system_log/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/system_log/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['status'] = res['status'];
							_that['logstring'] = res['logstring'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("system_log" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("system_log this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	systemlog.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/system_log?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new systemlog(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	systemlog.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/system_log/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new systemlog(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	systemlog.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("system_log" === data.collection && evt === "PUT"){
				_log("system_log Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("system_log" === data.collection && evt === "POST"){
				_log("system_log Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("system_log" === data.collection && evt === "DELETE"){
				_log("system_log Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};
	var emailoutbound = function(json) {
		_json2obj(json, this);
					this['subject'] = json['subject'];
					this['body'] = json['body'];
					this['to'] = json['to'];
	};
	

	emailoutbound.prototype = {
		toString: function() {
			return "emailoutbound";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/email_outbound";
			var json = {};
			json['subject'] = this['subject'];
			json['body'] = this['body'];
			json['to'] = this['to'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['subject'] = res['subject'];
					_that['body'] = res['body'];
					_that['to'] = res['to'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/email_outbound/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/email_outbound/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['subject'] = res['subject'];
							_that['body'] = res['body'];
							_that['to'] = res['to'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("email_outbound" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("email_outbound this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	emailoutbound.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/email_outbound?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new emailoutbound(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	emailoutbound.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/email_outbound/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new emailoutbound(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	emailoutbound.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("email_outbound" === data.collection && evt === "PUT"){
				_log("email_outbound Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("email_outbound" === data.collection && evt === "POST"){
				_log("email_outbound Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("email_outbound" === data.collection && evt === "DELETE"){
				_log("email_outbound Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};
	var emailinbound = function(json) {
		_json2obj(json, this);
					this['from'] = json['from'];
					this['subject'] = json['subject'];
					this['body'] = json['body'];
	};
	

	emailinbound.prototype = {
		toString: function() {
			return "emailinbound";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/email_inbound";
			var json = {};
			json['from'] = this['from'];
			json['subject'] = this['subject'];
			json['body'] = this['body'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['from'] = res['from'];
					_that['subject'] = res['subject'];
					_that['body'] = res['body'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/email_inbound/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/email_inbound/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['from'] = res['from'];
							_that['subject'] = res['subject'];
							_that['body'] = res['body'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("email_inbound" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("email_inbound this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	emailinbound.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/email_inbound?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new emailinbound(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	emailinbound.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/email_inbound/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new emailinbound(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	emailinbound.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("email_inbound" === data.collection && evt === "PUT"){
				_log("email_inbound Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("email_inbound" === data.collection && evt === "POST"){
				_log("email_inbound Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("email_inbound" === data.collection && evt === "DELETE"){
				_log("email_inbound Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};
	var emailunsubscribed = function(json) {
		_json2obj(json, this);
					this['to'] = json['to'];
	};
	

	emailunsubscribed.prototype = {
		toString: function() {
			return "emailunsubscribed";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/email_unsubscribed";
			var json = {};
			json['to'] = this['to'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['to'] = res['to'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/email_unsubscribed/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/email_unsubscribed/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['to'] = res['to'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("email_unsubscribed" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("email_unsubscribed this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	emailunsubscribed.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/email_unsubscribed?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new emailunsubscribed(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	emailunsubscribed.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/email_unsubscribed/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new emailunsubscribed(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	emailunsubscribed.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("email_unsubscribed" === data.collection && evt === "PUT"){
				_log("email_unsubscribed Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("email_unsubscribed" === data.collection && evt === "POST"){
				_log("email_unsubscribed Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("email_unsubscribed" === data.collection && evt === "DELETE"){
				_log("email_unsubscribed Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};
	var config = function(json) {
		_json2obj(json, this);
					this['config_key'] = json['config_key'];
					this['config_value'] = json['config_value'];
	};
	

	config.prototype = {
		toString: function() {
			return "config";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/config";
			var json = {};
			json['config_key'] = this['config_key'];
			json['config_value'] = this['config_value'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['config_key'] = res['config_key'];
					_that['config_value'] = res['config_value'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/config/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/config/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['config_key'] = res['config_key'];
							_that['config_value'] = res['config_value'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("config" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("config this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	config.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/config?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new config(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	config.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/config/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new config(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	config.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("config" === data.collection && evt === "PUT"){
				_log("config Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("config" === data.collection && evt === "POST"){
				_log("config Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("config" === data.collection && evt === "DELETE"){
				_log("config Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};
	var appointments = function(json) {
		_json2obj(json, this);
					this['Date'] = json['Date'];
					this['Phone'] = json['Phone'];
					this['Name'] = json['Name'];
					this['Services'] = json['Services'];
					this['SP'] = json['SP'];
					this['AptTime'] = json['AptTime'];
	};
	

	appointments.prototype = {
		toString: function() {
			return "appointments";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/appointments";
			var json = {};
			json['Date'] = this['Date'];
			json['Phone'] = this['Phone'];
			json['Name'] = this['Name'];
			json['Services'] = this['Services'];
			json['SP'] = this['SP'];
			json['AptTime'] = this['AptTime'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['Date'] = res['Date'];
					_that['Phone'] = res['Phone'];
					_that['Name'] = res['Name'];
					_that['Services'] = res['Services'];
					_that['SP'] = res['SP'];
					_that['AptTime'] = res['AptTime'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/appointments/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/appointments/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['Date'] = res['Date'];
							_that['Phone'] = res['Phone'];
							_that['Name'] = res['Name'];
							_that['Services'] = res['Services'];
							_that['SP'] = res['SP'];
							_that['AptTime'] = res['AptTime'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("appointments" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("appointments this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	appointments.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/appointments?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new appointments(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	appointments.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/appointments/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new appointments(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	appointments.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("appointments" === data.collection && evt === "PUT"){
				_log("appointments Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("appointments" === data.collection && evt === "POST"){
				_log("appointments Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("appointments" === data.collection && evt === "DELETE"){
				_log("appointments Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};
	var bills = function(json) {
		_json2obj(json, this);
					this['bill_no'] = json['bill_no'];
					this['bill_data'] = json['bill_data'];
					this['is_mmd'] = json['is_mmd'];
					this['date_num'] = json['date_num'];
					this['phone'] = json['phone'];
	};
	

	bills.prototype = {
		toString: function() {
			return "bills";
		},
		// Save object
		save: function(callback) {
			// save to db
			var url = _self._url + "/rest/bills";
			var json = {};
			json['bill_no'] = this['bill_no'];
			json['bill_data'] = this['bill_data'];
			json['is_mmd'] = this['is_mmd'];
			json['date_num'] = this['date_num'];
			json['phone'] = this['phone'];
			if (this['_id']) {
				json['_id'] = this['_id'];
				url += "/" + this['_id'];
			}
			if (this['_parent_id']) {json['_parent_id'] = this['_parent_id']};
			if (this['_parent_def']) {json['_parent_def'] = this['_parent_def']};
			if (this['_parent_field']) {json['_parent_field'] = this['_parent_field']};
			_log("save: ", url, json);
			var _that = this;
			var ajxopt = {url : url, type : (json._id ? 'PUT' : 'POST'), data: JSON.stringify(json), retry: true};
			if (!callback) {
				ajxopt.async = false;
			}
			_ajax(ajxopt, function(err, res){
				if (!err){
					_log("Saved ok ", res);
					_json2obj(res, _that);
					_that['bill_no'] = res['bill_no'];
					_that['bill_data'] = res['bill_data'];
					_that['is_mmd'] = res['is_mmd'];
					_that['date_num'] = res['date_num'];
					_that['phone'] = res['phone'];
					_log("After ajax save ", _that);
					if (callback){
						callback(err, _that);
					}
				} else {
					if (callback){
						callback(err, null);
					}
				}
			});
		},
		// Delete object
		delete: function(callback) {
			// delete from db
			var url = _self._url + "/rest/bills/"+this['_id'];
			_log("Delete: ", url)
			if (this['_id']) {
				_ajax({url : url, type : 'DELETE', retry: true}, callback);
			}
		},
		// Reload object from db by ID
		reload: function(callback){
			// find by ID
			var url = _self._url + "/rest/bills/" + this['_id'];
			_log("reload: ", url);
			if (this['_id']) {
				var _that = this;
				_ajax({url : url, type : 'GET', retry: true}, function(err, res){
					if (callback && !err){
						_log("Reloaded ok ", res);
							_json2obj(res, _that);
							_that['bill_no'] = res['bill_no'];
							_that['bill_data'] = res['bill_data'];
							_that['is_mmd'] = res['is_mmd'];
							_that['date_num'] = res['date_num'];
							_that['phone'] = res['phone'];
							callback(err, _that);
					} else {
						if (callback){
							callback(err, null);
						}
					}
				});
			} else {
				_log("Cannot reload object without an _id");
			}
		},
		// listen for PUT and DELETE events for this object
		on: function(evt, callback) {
			if (!opt.realtime) {return};
			// listen for realtime events
			var _that = this;
			$(document).on("lasnrsc22b_put_data_event",function(e, data){
				if ("bills" === data.collection && (evt === "PUT" || evt === "DELETE")){
					if (_that['_id'] && _that['_id'] === data.data){
						_log("bills this Observer: ",data);
						if (callback){callback(null, _that);}
					}
				}
			});
		}
		// Helper methods
	};
	// Query
	bills.find = function(query, hint, callback){
		// find by query
		var url = _self._url + "/rest/bills?q="+JSON.stringify(query);
		if (hint && hint.metafields) {
			url += "&metafields=true";
			delete hint.metafields;
		}
		_log("find: ", url);
		if (_isFunction(hint)) {
			callback = hint;
		} else {
			url += "&h="+JSON.stringify(hint);
		}
		_ajax({url : url, type : 'GET', retry: true}, function(_err, _res, _status, xhr){
			if (callback && !_err){
				var xpage = JSON.parse(xhr.getResponseHeader('X-Pagination'));
				_log(xpage);
				var index, len;
				var arr = [];
				if(hint["$aggregate"] || hint["$groupby"]) {
					callback(null, _res);
				} else {
					for (index = 0, len = _res.length; index < len; ++index) {
						arr.push( new bills(_res[index]));
					}
					callback(null, arr);
				}
				
			} else {
				if (callback){callback(_err, null);}
			}
		});
	};
	// Get object by ID
	bills.getById = function(ID, callback){
		// find by ID
		var url = _self._url + "/rest/bills/" + ID;
		_log("getById: ", url);
		_ajax({url : url, type : 'GET', retry: true}, function(err, res){
			if (callback && !err) {
				callback(null, new bills(res));
			} else {
				if (callback){
					callback(err, null);
				}
			}
		});
	};

	// listen for collection events
	bills.on = function(evt, callback){
		if (!opt.realtime) {return};
		// listen for realtime events
		$(document).on("lasnrsc22b_put_data_event",function(e, data){
			if ("bills" === data.collection && evt === "PUT"){
				_log("bills Observer put: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_post_data_event",function(e, data){
			if ("bills" === data.collection && evt === "POST"){
				_log("bills Observer post: ",data);
				if (callback){callback(null, data);}
			}
		});
		$(document).on("lasnrsc22b_delete_data_event",function(e, data){
			if ("bills" === data.collection && evt === "DELETE"){
				_log("bills Observer delete: ",data);
				if (callback){callback(null, data);}
			}
		});
	};

	// Public API methods
	return {
		on: _on,
		publish: _publish,
		logging: this.logging,
		url: this._url,
		apikey: this._apikey,
		systemjobs: systemjobs,
		systemlog: systemlog,
		emailoutbound: emailoutbound,
		emailinbound: emailinbound,
		emailunsubscribed: emailunsubscribed,
		config: config,
		appointments: appointments,
		bills: bills
	}
});