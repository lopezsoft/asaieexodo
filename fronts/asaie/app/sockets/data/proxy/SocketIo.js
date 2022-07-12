/**
 * @class Ext.store.data.proxy.SocketIo
 * @author Lewis Lopez Gomez <lopezsoft.com@gmail.com>
 *
 * HTML5 WebSocket proxy
 *
 * <h1>Cómo funciona?</h1>
 *
 */

Ext.define('Admin.sockets.data.proxy.SocketIo', {
    requires: ['Ext.Ajax','Admin.sockets.SocketIoManager'],
    extend: 'Ext.data.proxy.Server',
    alias: 'proxy.socketio',
    alternateClassName: ['Ext.data.HttpProxyIo', 'Ext.data.AjaxProxyIo', 'Ext.data.ServerProxyIo'],

    uses  : ['Ext.data.Request'],

    isRemote: true,

    isAjaxProxy: true,

    /**
     * @property (object) almacena los registros que seran enviados al servidor
     * cuando se realiza un proceso de: UPDATE, INSERT AND DELETE.
     */

    beforeRecords : null,

    beforeRequest : null,

    /**
     * @property {Object} callbacks
     * @private
     * Callbacks stack
     */
    callbacks: {},

    // Keep a default copy of the action methods here. Ideally could just null
    // out actionMethods and just check if it exists & has a property, otherwise
    // fallback to the default. But at the moment it's defined as a public property,
    // so we need to be able to maintain the ability to modify/access it.
    defaultActionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'POST',
        destroy: 'POST'
    },


    config: {

        /**
         * @cfg {String} url
         * The URL from which to request the data object.
         */
        url: '',

        /**
         * @cfg {String} [pageParam="page"]
         * The name of the 'page' parameter to send in a request. Defaults to 'page'. Set this to `''` if you don't
         * want to send a page parameter.
         */
        pageParam: 'page',

        /**
         * @cfg {String} [startParam="start"]
         * The name of the 'start' parameter to send in a request. Defaults to 'start'. Set this to `''` if you don't
         * want to send a start parameter.
         */
        startParam: 'start',

        /**
         * @cfg {String} [limitParam="limit"]
         * The name of the 'limit' parameter to send in a request. Defaults to 'limit'. Set this to `''` if you don't
         * want to send a limit parameter.
         */
        limitParam: 'limit',

        /**
         * @cfg {String} [groupParam="group"]
         * The name of the 'group' parameter to send in a request. Defaults to 'group'. Set this to `''` if you don't
         * want to send a group parameter.
         */
        groupParam: 'group',

        /**
         * @cfg {String} [groupDirectionParam="groupDir"]
         * The name of the direction parameter to send in a request. **This is only used when simpleGroupMode is set to
         * true.**
         */
        groupDirectionParam: 'groupDir',

        /**
         * @cfg {String} [sortParam="sort"]
         * The name of the 'sort' parameter to send in a request. Defaults to 'sort'. Set this to `''` if you don't
         * want to send a sort parameter.
         */
        sortParam: 'sort',

        /**
         * @cfg {String} [filterParam="filter"]
         * The name of the 'filter' parameter to send in a request. Defaults to 'filter'. Set this to `''` if you don't
         * want to send a filter parameter.
         */
        filterParam: 'filter',

        /**
         * @cfg {String} [directionParam="dir"]
         * The name of the direction parameter to send in a request. **This is only used when simpleSortMode is set to
         * true.**
         */
        directionParam: 'dir',

        /**
         * @cfg {String} [idParam="id"]
         * The name of the parameter which carries the id of the entity being operated upon.
         */
        idParam: 'id',

        /**
         * @cfg {Boolean} [simpleSortMode=false]
         * Enabling simpleSortMode in conjunction with remoteSort will only send one sort property and a direction when a
         * remote sort is requested. The {@link #directionParam} and {@link #sortParam} will be sent with the property name
         * and either 'ASC' or 'DESC'.
         */
        simpleSortMode: false,

        /**
         * @cfg {Boolean} [simpleGroupMode=false]
         * Enabling simpleGroupMode in conjunction with remoteGroup will only send one group property and a direction when a
         * remote group is requested. The {@link #groupDirectionParam} and {@link #groupParam} will be sent with the property name and either 'ASC'
         * or 'DESC'.
         */
        simpleGroupMode: false,

        /**
         * @cfg {Boolean} [noCache=true]
         * Disable caching by adding a unique parameter name to the request. Set to false to allow caching. Defaults to true.
         */
        noCache : true,

        /**
         * @cfg {String} [cacheString="_dc"]
         * The name of the cache param added to the url when using noCache. Defaults to "_dc".
         */
        cacheString: "_dc",

        /**
         * @cfg {Number} timeout
         * The number of milliseconds to wait for a response. Defaults to 30000 milliseconds (30 seconds).
         */
        timeout : 30000,

        /**
         * @cfg {Object} api
         * Specific urls to call on CRUD action methods "create", "read", "update" and "destroy". Defaults to:
         *
         *     api: {
         *         create  : undefined,
         *         read    : undefined,
         *         update  : undefined,
         *         destroy : undefined
         *     }
         *
         * The url is built based upon the action being executed [create|read|update|destroy] using the commensurate
         * {@link #api} property, or if undefined default to the configured
         * {@link Ext.data.Store}.{@link Ext.data.proxy.Server#url url}.
         *
         * For example:
         *
         *     api: {
         *         create  : '/controller/new',
         *         read    : '/controller/load',
         *         update  : '/controller/update',
         *         destroy : '/controller/destroy_action'
         *     }
         *
         * If the specific URL for a given CRUD action is undefined, the CRUD action request will be directed to the
         * configured {@link Ext.data.proxy.Server#url url}.
         */
        api: {
            create  : undefined,
            read    : undefined,
            update  : undefined,
            destroy : undefined
        },

        /**
         * @cfg {Object} extraParams
         * Extra parameters that will be included on every request. Individual requests with params of the same name
         * will override these params when they are in conflict.
         */
        extraParams: {},

        /**
         * @cfg {Boolean} binary
         * True to request binary data from the server.  This feature requires
         * the use of a binary reader such as {@link Ext.data.amf.Reader AMF Reader}
         */
        binary: false,

        /**
         * @cfg {Object} [headers]
         * Any headers to add to the Ajax request.
         *
         * example:
         *
         *     proxy: {
         *         headers: {'Content-Type': "text/plain" }
         *         ...
         *     }
         */
        headers: undefined,

        /**
         * @cfg {Boolean} paramsAsJson `true` to have any request parameters sent as {@link Ext.data.Connection#method-request jsonData}
         * where they can be parsed from the raw request. By default, parameters are sent via the
         * {@link Ext.data.Connection#method-request params} property. **Note**: This setting does not apply when the
         * request is sent as a 'GET' request. See {@link #actionMethods} for controlling the HTTP verb
         * that is used when sending requests.
         */
        paramsAsJson: false,

        /**
         * @cfg {Boolean} withCredentials
         * This configuration is sometimes necessary when using cross-origin resource sharing.
         * @accessor
         */
        withCredentials: false,

        /**
         * @cfg {Boolean} useDefaultXhrHeader
         * Set this to false to not send the default Xhr header (X-Requested-With) with every request.
         * This should be set to false when making CORS (cross-domain) requests.
         * @accessor
         */
        useDefaultXhrHeader: true,

        /**
         * @cfg {String} username
         * Most oData feeds require basic HTTP authentication. This configuration allows
         * you to specify the username.
         * @accessor
         */
        username: null,

        /**
         * @cfg {String} password
         * Most oData feeds require basic HTTP authentication. This configuration allows
         * you to specify the password.
         * @accessor
         */
        password: null,

        /**
         * @cfg {Object} actionMethods
         * Mapping of action name to HTTP request method. In the basic AjaxProxy these are set to 'GET' for 'read' actions
         * and 'POST' for 'create', 'update' and 'destroy' actions. The {@link Ext.data.proxy.Rest} maps these to the
         * correct RESTful methods.
         */
        actionMethods: {
            create : 'POST',
            read   : 'GET',
            update : 'POST',
            destroy: 'POST'
        },

        /**
         * @cfg {String} storeId (required) Id of the store associated
         */
        storeId: '',

		/**
		 * @cfn (String) typeData The way how data is processed. Ajax: sends requests to a server on the same domain.
		 * SocketIO Send the messages to the WebSocket.
		 */

		typeData : 'SocketIO',


		/**
         * @cfg {String} host (required) The URL/HOST to connect the websocket
         */
        host: '',

        protocol: 0,

        /**
         * @cfg {Boolean} forceNew Force new connection
         *
         */

        forceNew: true,

        /**
         * @cfg {Ext.ux.WebSocket} websocket An instance of Ext.ux.WebSocket (no needs to make a new one)
         */
        websocket: null,

        /**
         * @cfg (Boolean) whether to reconnect automatically (true)
         */
        reconnection: true,

       /**
         * @cfg reconnectionDelay (Number) how long to initially wait before attempting a new
            reconnection (1000). Affected by +/- randomizationFactor,
            for example the default initial delay will be between 500 to 1500ms.
         */

        reconnectionDelay : 5000,

        /**
         * @cfg randomizationFactor (Number) (0.5), 0 <= randomizationFactor <= 1
         */

        randomizationFactor : 0.5,

        /**
         * @cfg timeout (Number) connection timeout before a connect_error
            and connect_timeout events are emitted (20000)
         */

        wsTimeout : 2000,

        /**
         * @cfg autoConnect (Boolean) by setting this false, you have to call manager.open
            whenever you decide it's appropriate
         */

        autoConnect : true,

        /**
         * @cfg reconnectionDelayMax (Number) maximum amount of time to wait between
            reconnections (5000). Each attempt increases the reconnection delay by 2x
            along with a randomization as above
         */
        reconnectionDelayMax : 5000,

        /**
         * @cfg {Boolean} keepUnsentMessages Keep unsent messages and try to send them back after the connection is open again.
         */
        keepUnsentMessages: true
    },

    constructor: function (cfg) {
        var me = this;

        // Requires a configuration
        if (Ext.isEmpty(cfg)) {
            Ext.Error.raise('Se necesita una configuración!');
            return false;
        }

        me.initConfig(cfg);
        me.mixins.observable.constructor.call(me, cfg);
        // Requires a storeId
        if (Ext.isEmpty(me.getStoreId())) {
            Ext.Error.raise('La propieda storeId es necesaria!');
            return false;
        }

        if (Ext.isEmpty(me.getWebsocket())) {
            me.setWebsocket(Ext.create('Admin.sockets.SocketIoManager', {
                url                 : me.getHost(),
                protocol            : me.getProtocol(),
                communicationType   : 'event',
                reconnection        : me.getReconnection(),
                reconnectionDelay   : me.getReconnectionDelay(),
                randomizationFactor : me.getRandomizationFactor(),
                timeout             : me.getWsTimeout(),
                autoConnect         : me.getAutoConnect(),
                reconnectionDelayMax: me.getReconnectionDelayMax(),
                keepUnsentMessages  : me.getKeepUnsentMessages(),
                storeId             : me.getStoreId()
            }));
        }

        var ws = me.getWebsocket();

        if(Ext.isEmpty(me.getUrl())){
            ws.on(me.getApi().create, function (data) {
                me.completeTask('create', me.getApi().create, data);
            });

            ws.on(me.getApi().read, function (data) {
                me.completeTask('read', me.getApi().read, data);
            });

            ws.on(me.getApi().update, function (data) {
                me.completeTask('update', me.getApi().update, data);
            });

            ws.on(me.getApi().destroy, function (data) {
                me.completeTask('destroy', me.getApi().destroy, data);
            });
        }else {
            ws.on(me.getUrl(), function (data) {
                me.completeTask('read', me.getUrl(), data);
            });
        };

        me.callParent([cfg]);

        return me;
    },


    /**
     * @event exception
     * Fires when the server returns an exception. This event may also be listened
     * to in the event that a request has timed out or has been aborted.
     * @param {Ext.data.proxy.Proxy} this
     * @param {Ext.data.Response} response The response that was received
     * @param {Ext.data.operation.Operation} operation The operation that triggered the request
     */

    //in a ServerProxy all four CRUD operations are executed in the same manner, so we delegate to doRequest in each case
    create: function(operation) {
        return this.doRequest.apply(this, arguments);
    },

    read: function(operation) {
        return this.doRequest.apply(this, arguments);
    },

    update: function(operation) {
        return this.doRequest.apply(this, arguments);
    },

    erase: function(operation) {
        return this.doRequest.apply(this, arguments);
    },


    /**
     * Sets a value in the underlying {@link #extraParams}.
     * @param {String} name The key for the new value
     * @param {Object} value The value
     */
    setExtraParam: function(name, value) {
        var extraParams = this.getExtraParams();
        extraParams[name] = value;
        this.extraparamschanged(extraParams);
    },

    updateExtraParams: function(newExtraParams, oldExtraParams) {
        this.extraparamschanged(newExtraParams);
    },

    extraparamschanged : function (e) {

    },

    /**
     * Creates an {@link Ext.data.Request Request} object from {@link Ext.data.operation.Operation Operation}.
     *
     * This gets called from doRequest methods in subclasses of Server proxy.
     *
     * @param {Ext.data.operation.Operation} operation The operation to execute
     * @return {Ext.data.Request} The request object
     */
    buildRequest: function(operation) {
        var me = this,
            initialParams = Ext.apply({}, operation.getParams()),
            // Clone params right now so that they can be mutated at any point further down the call stack
            params = Ext.applyIf(initialParams, me.getExtraParams() || {}),
            request,
            operationId,
            idParam;

        //copy any sorters, filters etc into the params so they can be sent over the wire
        Ext.applyIf(params, me.getParams(operation));

        // Set up the entity id parameter according to the configured name.
        // This defaults to "id". But TreeStore has a "nodeParam" configuration which
        // specifies the id parameter name of the node being loaded.
        operationId = operation.getId();
        idParam = me.getIdParam();
        if (operationId !== undefined && params[idParam] === undefined) {
            params[idParam] = operationId;
        }
        me.beforeRecords  = operation.getRecords();
        request = new Ext.data.Request({
            params   : params,
            action   : operation.getAction(),
            records  : operation.getRecords(),
            url      : operation.getUrl(),
            operation: operation,

            // this is needed by JsonSimlet in order to properly construct responses for
            // requests from this proxy
            proxy: me
        });

        request.setUrl(me.buildUrl(request));
        me.beforeRequest    = request;
        /*
         * Save the request on the Operation. Operations don't usually care about Request and Response data, but in the
         * ServerProxy and any of its subclasses we add both request and response as they may be useful for further processing
         */
        operation.setRequest(request);

        return request;
    },

    /**
     * Respuesta de procesos, que puede implicar la actualización o la confirmación de registros, cada uno de los cuales
     * Informará a las tiendas propietarias y sus puntos de vista interesados.
     * Finalmente, podemos realizar un diseño adicional si la forma de datos ha cambiado.
     *
     * @protected
     */
    processResponse: function(success, operation, request, response) {
        var me = this,
            exception, reader, resultSet, meta;

        // Async callback could have landed at any time, including during and after
        // destruction. We don't want to unravel the whole response chain in such case.
        if (me.destroying || me.destroyed) {
            return;
        }

        // Processing a response may involve updating or committing many records
        // each of which will inform the owning stores, which will ultimately
        // inform interested views which will most likely have to do a layout
        // assuming that the data shape has changed.
        // Bracketing the processing with this event gives owning stores the ability
        // to fire their own beginupdate/endupdate events which can be used by interested
        // views to suspend layouts.
        me.fireEvent('beginprocessresponse', me, response, operation);

        if (success === true) {
            reader = me.getReader();

            if (response.status === 204) {
                resultSet = reader.getNullResultSet();
            } else {
                resultSet = reader.read(me.extractResponseData(response), {
                    // If we're doing an update, we want to construct the models ourselves.
                    recordCreator: operation.getRecordCreator()
                });
            }

            operation.process(resultSet, request, response);
            exception = !operation.wasSuccessful();
        } else {
            me.setException(operation, response);
            exception = true;
        }

        if (exception) {
            me.fireEvent('exception', me, response, operation);
        }

        // If a JsonReader detected metadata, process it now.
        // This will fire the 'metachange' event which the Store processes to fire its own 'metachange'
        else {
            meta = resultSet.getMetadata();
            if (meta) {
                me.onMetaChange(meta);
            }
        }

        me.afterRequest(operation,request, success, response);

        // Tell owning store processing has finished.
        // It will fire its endupdate event which will cause interested views to
        // resume layouts.
        me.fireEvent('endprocessresponse', me, response, operation);
    },

    /**
     * Sets up an exception on the operation
     * @private
     * @param {Ext.data.operation.Operation} operation The operation
     * @param {Object} response The response
     */
    setException: function(operation, response) {
        operation.setException({
            status: response.status,
            statusText: response.statusText,
            response: response
        });
    },

    /**
     * @method
     * Template method to allow subclasses to specify how to get the response for the reader.
     * @template
     * @private
     * @param {Object} response The server response
     * @return {Object} The response data to be used by the reader
     */
    extractResponseData: Ext.identityFn,

    /**
     * Encode any values being sent to the server. Can be overridden in subclasses.
     * @protected
     * @param {Array} value An array of sorters/filters.
     * @return {Object} The encoded value
     */
    applyEncoding: function(value) {
        return Ext.encode(value);
    },

    /**
     * Encodes the array of {@link Ext.util.Sorter} objects into a string to be sent in the request url. By default,
     * this simply JSON-encodes the sorter data
     * @param {Ext.util.Sorter[]} sorters The array of {@link Ext.util.Sorter Sorter} objects
     * @param {Boolean} [preventArray=false] Prevents the items from being output as an array.
     * @return {String} The encoded sorters
     */
    encodeSorters: function(sorters, preventArray) {
        var out = [],
            length = sorters.length,
            i;

        for (i = 0; i < length; i++) {
            out[i] = sorters[i].serialize();
        }

        return this.applyEncoding(preventArray ? out[0] : out);
    },

    /**
     * Encodes the array of {@link Ext.util.Filter} objects into a string to be sent in the request url. By default,
     * this simply JSON-encodes the filter data
     * @param {Ext.util.Filter[]} filters The array of {@link Ext.util.Filter Filter} objects
     * @return {String} The encoded filters
     */
    encodeFilters: function (filters) {
        var out = [],
            length = filters.length,
            i, filter;

        for (i = 0; i < length; i++) {
            filter = filters[i];

            // Filters with a custom filterFn cannot be serialized.  But since #getFilterFn()
            // always returns a filterFn, we need to check if it's been generated by default.
            // If so, we know that the filter cannot have a custom filterFn defined, and it
            // is therefore okay to serialize.
            filter.getFilterFn();
            if (filter.generatedFilterFn) {
                out.push(filter.serialize());
            }
        }

        return this.applyEncoding(out);
    },

    /**
     * @private
     * Copy any sorters, filters etc into the params so they can be sent over the wire
     */
    getParams: function(operation) {
        if (!operation.isReadOperation) {
            return {};
        }

        var me = this,
            params = {},
            grouper = operation.getGrouper(),
            sorters = operation.getSorters(),
            filters = operation.getFilters(),
            page = operation.getPage(),
            start = operation.getStart(),
            limit = operation.getLimit(),
            simpleSortMode = me.getSimpleSortMode(),
            simpleGroupMode = me.getSimpleGroupMode(),
            pageParam = me.getPageParam(),
            startParam = me.getStartParam(),
            limitParam = me.getLimitParam(),
            groupParam = me.getGroupParam(),
            groupDirectionParam = me.getGroupDirectionParam(),
            sortParam = me.getSortParam(),
            filterParam = me.getFilterParam(),
            directionParam = me.getDirectionParam(),
            hasGroups, index;

        if (pageParam && page) {
            params[pageParam] = page;
        }

        if (startParam && (start || start === 0)) {
            params[startParam] = start;
        }

        if (limitParam && limit) {
            params[limitParam] = limit;
        }

        hasGroups = groupParam && grouper;
        if (hasGroups) {
            // Grouper is a subclass of sorter, so we can just use the sorter method
            if (simpleGroupMode) {
                params[groupParam] = grouper.getProperty();
                params[groupDirectionParam] = grouper.getDirection();
            } else {
                params[groupParam] = me.encodeSorters([grouper], true);
            }
        }

        if (sortParam && sorters && sorters.length > 0) {
            if (simpleSortMode) {
                index = 0;
                // Group will be included in sorters, so grab the next one
                if (sorters.length > 1 && hasGroups) {
                    index = 1;
                }
                params[sortParam] = sorters[index].getProperty();
                params[directionParam] = sorters[index].getDirection();
            } else {
                params[sortParam] = me.encodeSorters(sorters);
            }

        }

        if (filterParam && filters && filters.length > 0) {
            params[filterParam] = me.encodeFilters(filters);
        }

        return params;
    },

    /**
     * Generates a url based on a given Ext.data.Request object. By default, ServerProxy's buildUrl will add the
     * cache-buster param to the end of the url. Subclasses may need to perform additional modifications to the url.
     * @param {Ext.data.Request} request The request object
     * @return {String} The url
     */
    buildUrl: function(request) {
        var me = this,
            url = me.getUrl(request);

        //<debug>
        if (!url) {
            Ext.raise("You are using a ServerProxy but have not supplied it with a url.");
        }
        //</debug>

        if (me.getNoCache() && me.getTypeData() == 'Ajax') {
            url = Ext.urlAppend(url, Ext.String.format("{0}={1}", me.getCacheString(), Ext.Date.now()));
        }

        return url;
    },

    /**
     * Get the url for the request taking into account the order of priority,
     * - The request
     * - The api
     * - The url
     * @private
     * @param {Ext.data.Request} request The request
     * @return {String} The url
     */
    getUrl: function(request) {
        var url;
        if (request) {
            url = request.getUrl() || this.getApi()[request.getAction()];
        }
        return url ? url : this.callParent();
    },

    /**
     * In ServerProxy subclasses, the {@link #method-create}, {@link #method-read}, {@link #method-update} and
     * {@link #method-erase} methods all pass through to doRequest. Each ServerProxy subclass must implement the
     * doRequest method - see {@link Ext.data.proxy.JsonP} and {@link Ext.data.proxy.Ajax} for examples. This method
     * carries the same signature as each of the methods that delegate to it.
     *
     * @param {Ext.data.operation.Operation} operation The Ext.data.operation.Operation object
     * @param {Function} callback The callback function to call when the Operation has completed
     * @param {Object} scope The scope in which to execute the callback
     */

    /**
     * Optional callback function which can be used to clean up after a request has been completed.
     * @param {Ext.data.Request} request The Request object
     * @param {Boolean} success True if the request was successful
     * @protected
     * @template
     * @method
     */

    afterRequest: function (o,req, succ, res) {
        var
            ws  = this.getWebsocket(),
            me  = this;
       if(succ){
           if(req.getAction()=='read'){
               return false;
           };
           var d = Ext.JSON.decode(res.responseText),
               data = [],
               i    = 0,
               nRecords;
           if(req.getAction()=='create'){
               data.push(d.records);
               nRecords    = 1;
           }else{
               for (i = 0; i < me.beforeRecords.length; i++) {
                   data.push(me.beforeRecords[i].data);
               }
               nRecords = me.beforeRecords.length;
           }

           dataSend = {
               data     : data,
               id_user  : d.id_user,
               user_type: d.user_type,
               reccount : nRecords,
               date     : d.fecha,
               event    : req.getUrl(),
               id_inst  : d.id_inst,
               año      : d.año,
               action   : req.getAction(),
               storeId  : me.getStoreId(),
               server   : ws.getUrl()
           };
           ws.send(req.getAction(),Ext.encode(dataSend));
       }
    },

    doRequest: function(operation) {
        var me = this,
            writer  = me.getWriter(),
            request = me.buildRequest(operation),
            method  = me.getMethod(request),
            jsonData, params;
        if (writer && operation.allowWrite()) {
            request = writer.write(request);
        }
        request.setConfig({
            binary              : me.getBinary(),
            headers             : me.getHeaders(),
            timeout             : me.getTimeout(),
            scope               : me,
            callback            : me.createRequestCallback(request, operation),
            method              : method,
            useDefaultXhrHeader : me.getUseDefaultXhrHeader(),
            disableCaching      : false // explicitly set it to false, ServerProxy handles caching
        });

        if (method.toUpperCase() !== 'GET' && me.getParamsAsJson()) {
            params = request.getParams();

            if (params) {
                jsonData = request.getJsonData();
                if (jsonData) {
                    jsonData = Ext.Object.merge({}, jsonData, params);
                } else {
                    jsonData = params;
                }
                request.setJsonData(jsonData);
                request.setParams(undefined);
            }
        }

        if (me.getWithCredentials()) {
            request.setWithCredentials(true);
            request.setUsername(me.getUsername());
            request.setPassword(me.getPassword());
        }
        return me.sendRequest(request);
    },

    /**
     * Fires a request
     * @param {Ext.data.Request} request The request
     * @return {Ext.data.Request} The request
     * @private
     */
    sendRequest: function(request) {
    	var
			me = this;

    	if (me.getTypeData() == 'Ajax'){
			request.setRawRequest(Ext.Ajax.request(request.getCurrentConfig()));
		}else{
			request.setRawRequest(Ext.sockets.Socket.request(request.getCurrentConfig()));
		}

        this.lastRequest = request;
        return request;
    },

    /**
     * Aborts a running request.
     * @param {Ext.data.Request} [request] The request to abort. If not passed, the most recent active
     * request will be aborted.
     */
    abort: function(request) {
        request = request || this.lastRequest;
        if (request) {
            Ext.Ajax.abort(request.getRawRequest());
        }
    },

    /**
     * Returns the HTTP method name for a given request. By default this returns based on a lookup on
     * {@link #actionMethods}.
     * @param {Ext.data.Request} request The request object
     * @return {String} The HTTP method to use (should be one of 'GET', 'POST', 'PUT' or 'DELETE')
     */
    getMethod: function(request) {
        var actions = this.getActionMethods(),
            action = request.getAction(),
            method;

        if (actions) {
            method = actions[action];
        }
        return method || this.defaultActionMethods[action];
    },

    /**
     * @private
     * TODO: This is currently identical to the JsonPProxy version except for the return function's signature. There is a lot
     * of code duplication inside the returned function so we need to find a way to DRY this up.
     * @param {Ext.data.Request} request The Request object
     * @param {Ext.data.operation.Operation} operation The Operation being executed
     * @return {Function} The callback function
     */
    createRequestCallback: function(request, operation) {
        var me = this;

        return function(options, success, response) {
            if (request === me.lastRequest) {
                me.lastRequest = null;
            }
            me.processResponse(success, operation, request, response);
        };
    },

    destroy: function() {
        var me = this;

        me.lastRequest = null;
        me.destroying = true;

        // Don't force Reader and Writer creation if they weren't yet instantiated
        me.reader = me.writer = Ext.destroy(me.reader, me.writer);

        me.callParent();

        me.destroying = false;
        me.destroyed = true;
    }
});
