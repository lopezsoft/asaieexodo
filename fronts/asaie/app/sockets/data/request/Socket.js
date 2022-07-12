/**
 * This class manages a pending Ajax request. Instances of this type are created by the
 * `{@link Ext.data.Connection#request}` method.
 * @since 6.0.0
 */
Ext.define('Admin.sockets.data.request.Socket', {
	extend: 'Ext.data.request.Base',
	alias:  'request.socket',
	requires: [
		'Ext.data.flash.BinaryXhr',
		'Admin.sockets.SocketIoManager'
	],
	config : {
		websocket: null
	},
	statics: {
		/**
		 * Checks if the response status was successful
		 * @param {Number} status The status code
		 * @param {Object} response The Response object
		 * @return {Object} An object containing success/status state
		 * @private
		 */
		parseStatus: function(status, response) {
			var success = (status >= 200 && status < 300) || status == 304 || status == 0,
				isException = false;
			console.log(status);
			console.log(response);
			if (!success) {
				switch (status) {
					case 12002:
					case 12029:
					case 12030:
					case 12031:
					case 12152:
					case 13030:
						isException = true;
						break;
				}
			}

			return {
				success: success,
				isException: isException
			};
		}
	},

	/**
	 * Checks if the response status was successful
	 * @param {Number} status The status code
	 * @param {Object} response The Response object
	 * @return {Object} An object containing success/status state
	 * @private
	 */
	parseStatus: function(status, response) {
		var success = (status >= 200 && status < 300) || status == 304 || status == 0,
			isException = false;
		if (!success) {
			switch (status) {
				case 12002:
				case 12029:
				case 12030:
				case 12031:
				case 12152:
				case 13030:
					isException = true;
					break;
			}
		}

		return {
			success: success,
			isException: isException
		};
	},

	start: function(data) {
		var me = this,
			options = me.ownerConfig,
			ws;
		ws = me.openRequest(data);
		if (me.async) {
			ws.send    = Ext.Function.bind(me.onSend,me);
			ws.receive = Ext.Function.bind(me.onReceive,me);
			ws.send(data.url[0],data.extraParams,data.params);
			ws.receive(data.url[1]);
		}
		// Parent will set the timeout if needed
		me.callParent([data]);
		// start the request!
		if (!me.async) {
			return me.onComplete();
		}
		return me;
	},

	onSend : function (func,data,params) {
		var me = this,
			ws;
		ws = me.getWebsocket();
		ws.socket.emit(func,data,params);
		return me;
	},

	onReceive : function (func) {
		var me = this,
			globalEvents = Ext.GlobalEvents,
			ws;
		ws = me.getWebsocket();
		ws.socket.on(func,function (result,error) {
			me.clearTimer();
			if (error){
				me.onComplete(error);
			}else{
				me.onComplete(result);
			}
			me.cleanup();

			if (globalEvents.hasListeners.idle) {
				globalEvents.fireEvent('idle');
			}
		});

		return me;
	},

	/**
	 * Aborts an active request.
	 */
	abort: function(force) {
		var me = this;
		if (force || me.isLoading()) {
			me.callParent([force]);
			me.onComplete();
			me.cleanup();
		}
	},

	/**
	 * Cleans up any left over information from the request
	 */
	cleanup: function() {
		var
			me = this;
		me.getWebsocket().close();
		me.websocket = null;
	},

	isLoading: function() {
		var me = this,
			xhr = me.xhr,
			state = xhr && xhr.readyState,
			C = Ext.data.flash && Ext.data.flash.BinaryXhr;

		if (!xhr || me.aborted || me.timedout) {
			return false;
		}

		// if there is a connection and readyState is not 0 or 4, or in case of
		// BinaryXHR, not 4
		if (C && xhr instanceof C) {
			return state !== 4;
		}
		return state !== 0 && state !== 4;
	},

	/**
	 * Creates and opens an appropriate XHR transport for a given request on this browser.
	 * This logic is contained in an individual method to allow for overrides to process all
	 * of the parameters and options and return a suitable, open connection.
	 * @private
	 */
	openRequest: function(options) {
		var
			me	= options || {};
		this.setWebsocket(Ext.create('Admin.sockets.SocketIoManager', {
			url                 : me.host || '',
			protocol            : me.protocol || 0,
			communicationType   : 'event',
			reconnection        : me.reconnection,
			reconnectionDelay   : me.reconnectionDelay,
			randomizationFactor : me.randomizationFactor,
			timeout             : me.timeout,
			autoConnect         : me.autoConnect,
			reconnectionDelayMax: me.reconnectionDelayMax,
			keepUnsentMessages  : me.keepUnsentMessages,
			storeId             : me.storeId,
			typeData			: me.typeData
		}));
		return this.getWebsocket();
	},

	/**
	 * To be called when the request has come back from the server
	 * @param {Object} request
	 * @return {Object} The response
	 * @private
	 */
	onComplete: function(wsResult) {
		var me = this,
			owner = me.owner,
			options = me.options,
			failure = { success: false, isException: false },
			result, success, response;
		try {
			result = this.parseStatus(wsResult.status,wsResult);
		}
		catch (e) {
			// In some browsers we can't access the status if the readyState is not 4,
			// so the request has failed
			result = failure;
		}

		success = me.success = result.success;
		if (success) {
			response = me.createResponse(wsResult);

			if (owner.hasListeners.requestcomplete) {
				owner.fireEvent('requestcomplete', owner, response, options);
			}

			if (options.success) {
				Ext.callback(options.success, options.scope, [response, options]);
			}
		}
		else {
			if (result.isException || me.aborted || me.timedout) {
				response = me.createException(wsResult);
			}
			else {
				response = me.createResponse(wsResult);
			}

			if (owner.hasListeners.requestexception) {
				owner.fireEvent('requestexception', owner, response, options);
			}

			if (options.failure) {
				Ext.callback(options.failure, options.scope, [response, options]);
			}
		}

		me.result = response;

		if (options.callback) {
			Ext.callback(options.callback, options.scope, [options, success, response]);
		}
		owner.onRequestComplete(me);
		me.callParent([wsResult]);
		return response;
	},

	/**
	 * Creates the response object
	 * @param {Object} request
	 * @private
	 */
	createResponse: function(ws) {
		var me = this,
			response;
		response = {
			request: me,
			requestId: me.id,
			status: ws.status,
			statusText: ws.statusText
		};
		response.responseText = ws.responseText;
		return response;
	},

	destroy: function() {
		this.xhr = null;
		this.callParent();
	}
});
