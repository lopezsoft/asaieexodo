/**
 * @class Ext.ux.WebSocket
 * @author Vincenzo Ferrari <wilk3ert@gmail.com>
 *
 * Wrapper for HTML5 WebSocket
 *
 * This class provide an interface for HTML5 WebSocket.
 *
 * <h1>Pure text communication</h1>
 * The communication is text-only, without objects or any other kind of data.
 *
 *     var websocket = Ext.create ('Ext.ux.WebSocket', {
 *       url: 'ws://localhost:8888' ,
 *       listeners: {
 *         open: function (ws) {
 *           console.log ('The websocket is ready to use');
 *           ws.send ('This is a simple text');
 *         } ,
 *         close: function (ws) {
 *           console.log ('The websocket is closed!');
 *         } ,
 *         error: function (ws, error) {
 *           Ext.Error.raise (error);
 *         } ,
 *         message: function (ws, message) {
 *           console.log ('A new message is arrived: ' + message);
 *         }
 *       }
 *     });
 *
 * <h1>Pure event-driven communication</h1>
 * The communication is event-driven: an event and a String or Object are sent and the websocket handles different events.
 *
 *     var websocket = Ext.create ('Ext.ux.WebSocket', {
 *       url: 'ws://localhost:8888' ,
 *       listeners: {
 *         open: function (ws) {
 *           console.log ('The websocket is ready to use');
 *           ws.send ('init', 'This is a simple text');
 *           ws.send ('and continue', {
 *             'my': 'data' ,
 *             'your': 'data'
 *           });
 *         } ,
 *         close: function (ws) {
 *           console.log ('The websocket is closed!');
 *         }
 *       }
 *     });
 *
 *     // A 'stop' event is sent from the server
 *     // 'data' has 'cmd' and 'msg' fields
 *     websocket.on ('stop', function (data) {
 *       console.log ('Command: ' + data.cmd);
 *       console.log ('Message: ' + data.msg);
 *     });
 *
 * <h1>Mixed event-driven and text communication</h1>
 * The communication is mixed: it can handles text-only and event-driven communication.
 *
 *     var websocket = Ext.create ('Ext.ux.WebSocket', {
 *       url: 'ws://localhost:8888' ,
 *       listeners: {
 *         open: function (ws) {
 *           console.log ('The websocket is ready to use');
 *           ws.send ('This is only-text message');
 *           ws.send ('init', 'This is a simple text');
 *           ws.send ('and continue', {
 *             'my': 'data' ,
 *             'your': 'data'
 *           });
 *         } ,
 *         close: function (ws) {
 *           console.log ('The websocket is closed!');
 *         } ,
 *         message: function (ws, message) {
 *           console.log ('Text-only message arrived is: ' + message);
 *         }
 *       }
 *     });
 *
 *     // A 'stop' event is sent from the server
 *     // 'data' has 'cmd' and 'msg' fields
 *     websocket.on ('stop', function (data) {
 *       console.log ('Command: ' + data.cmd);
 *       console.log ('Message: ' + data.msg);
 *     });
 */

Ext.define('Admin.sockets.SocketIoManager', {
    alias: 'socketiomanager',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: ['Ext.util.TaskManager'],
    /**
     * @event open
     * Fires after the websocket has been connected.
     * @param {Ext.ux.WebSocket} this The websocket
     */

    /**
     * @event error
     * Fires after an error occured
     * @param {Ext.ux.WebSocket} this The websocket
     * @param {Object} error The error object to display
     */

    /**
     * @event close
     * Fires after the websocket has been disconnected.
     * @param {Ext.ux.WebSocket} this The websocket
     */

    /**
     * @event message
     * Fires after a message is arrived from the server.
     * @param {Ext.ux.WebSocket} this The websocket
     * @param {String/Object} message The message arrived
     */

    config: {
        /**
         * @cfg {String} storeId (required) Id of the store associated
         */
        storeId: '',
        /**
         * @cfg {String} url (required) The URL to connect
         */
        url: '',

        /**
         * @cfg {String} communicationType The type of communication. 'both' (default) for event-driven and pure-text communication, 'event' for only event-driven and 'text' for only pure-text.
         */
        communicationType: 'both',

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

        reconnectionDelay : 30000,

        /**
         * @cfg randomizationFactor (Number) (0.5), 0 <= randomizationFactor <= 1
         */

        randomizationFactor : 0.5,

        /**
         * @cfg timeout (Number) connection timeout before a connect_error
         and connect_timeout events are emitted (20000)
         */

        timeout : 5000,

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
        keepUnsentMessages: false
    },

    /**
     * @property {Object} memento
     * @private
     * Internal memento
     */
    memento: {},

    /**
     * @property {Array} memento
     * @private
     * Internal queue of unsent messages
     */
    messageQueue: [],

    /**
     * Creates new WebSocket
     * @param {String/Object} config The configuration options may be specified as follows:
     *
     *     // with a configuration set
     *     var config = {
	 *       url: 'your_url' ,
	 *       protocol: 'your_protocol'
	 *     };
     *
     *     var ws = Ext.create ('Ext.ux.WebSocket', config);
     *
     *     // or with websocket url only
     *     var ws = Ext.create ('Ext.ux.WebSocket', 'ws://localhost:30000');
     *
     * @return {Ext.ux.WebSocket} An instance of Ext.ux.WebSocket or null if an error occurred.
     */

    connected   : false,

    constructor: function (cfg) {
        var me = this;
        // Raises an error if no url is given
        if (Ext.isEmpty(cfg)) {
            Ext.Error.raise('URL for the websocket is required!');
            return null;
        }

        // Allows initialization with string
        // e.g.: Ext.create ('Ext.ux.WebSocket', 'ws://localhost:8888');
        if (typeof cfg === 'string') {
            cfg = {
                url: cfg
            };
        }

        me.initConfig(cfg);
        me.mixins.observable.constructor.call(me, cfg);

        try {
            // Initializes internal websocket
            me.initSocketIo();
            me.memento = Ext.create('Ext.util.Memento');
            me.memento.capture('autoConnect', me);
        }
        catch (err) {
            Ext.Error.raise(err);
            return null;
        }

        return me;
    },

    /**
     * @method isReady
     * Returns if the websocket connection is up or not
     * @return {Boolean} True if the connection is up, False otherwise
     */
    isReady: function () {
        return this.getStatus();
    },

    /**
     * @method getStatus
     * Returns the current status of the websocket
     * @return {Number} The current status of the websocket (0: connecting, 1: open, 2: closed)
     */
    getStatus: function () {
        return this.socket.connected;
    },

    /**
     * @method close
     * Closes the websocket and kills the autoreconnect task, if exists
     * @return {Ext.ux.WebSocket} The websocket
     */
    close: function () {
        var me = this;

        if (me.autoConnect) {
            Ext.TaskManager.stop(me.autoConnect);
            delete me.autoConnect;
        }
        // Deactivate autoReconnect until the websocket is open again
        me.setAutoConnect(false);
        me.socket.close();
        return me;
    },

    /**
     * @method open
     * Re/Open the websocket
     * @return {Ext.ux.WebSocket} The websocket
     */
    open: function () {
        var me = this;

        // Restore autoReconnect initial value
        me.memento.restore('autoConnect', false, me);
        me.initWebsocket();

        return me;
    },

    /**
     * @method send
     * Sends a message.
     * This method is bind at run-time level because it changes on the websocket initial configuration.
     * It supports three kind of communication:
     *
     *    1. text-only
     *      Syntax: ws.send (string);
     *      Example: ws.send ('hello world!');
     *    2. event-driven
     *      Syntax: ws.send (event, string/object);
     *      Example 1: ws.send ('greetings', 'hello world!');
     *      Example 2: ws.send ('greetings', {text: 'hello world!'});
     *    3. hybrid (text and event)
     *      It uses both: see examples above
     * @param {String/Object} message Can be a single text message or an association of event/message.
     */
    send: function () {

    },


	receive: function () {

	},

    /**
     * @method initSocketIo
     * Internal socketio initialization
     * @private
     */
    initSocketIo: function () {
        var me = this;
        me.socket = io.connect(me.getUrl(),{ 'forceNew': true });

        me.socket.on('connect',function() {
            console.log('socket connected');
            // It will be reactivated at the next onclose event
            if (me.autoConnect) {
                Ext.TaskManager.stop(me.autoConnect);
                delete me.autoConnect;
            };

            // Flush unset messages
            if (me.getKeepUnsentMessages() && me.messageQueue.length > 0) {
                while (me.messageQueue.length > 0) {
                    // Avoid infinite loop into safeSend method
                    if (me.isReady()) me.safeSend(me.messageQueue.shift());
                    else break;
                }
            };

            me.fireEvent('open', me);
        });

        me.socket.on('error',function (error) {
            me.fireEvent('error', me, error);
            console.log(error);
        });

        me.socket.on('reconnect_error',function (error) {
            Admin.getApplication().showResult('No hay conexión con el servidor de sockets, contante al administrador del sistema.', 'error');
            me.fireEvent('error', me, error);
        });

        me.socket.on('close',function() {
            me.fireEvent('close', me);
            // Setups the auto reconnect task, just one
            if (me.getAutoConnect() && (typeof me.autoConnect === 'undefined')) {
                me.autoConnect = Ext.TaskManager.start({
                    run: function () {
                        // It reconnects only if it's disconnected
                        if (!me.isReady()) {
                            me.initWebsocket();
                        }
                    },
                    interval: me.getReconnectionDelay()
                });
            }
        });

        me.socket.on('disconnect', function(){
            console.log('Servidor desconectado');
        });

        me.socket.on('receiveEventMessage',function (data) {
          me.receiveEventMessage(data);
        });

        me.send = Ext.bind(me.sendEventMessage, this);

    },

    /**
     * @method getOptions
     * Returns the options of the socket.io manager
     * @private
     */
    getOptions : function () {
        var me  = this,
            options = {};

        options = {
            reconnection        : me.getReconnection(),
            reconnectionDelay   : me.getReconnectionDelay(),
            randomizationFactor : me.getRandomizationFactor(),
            timeout             : me.getTimeout(),
            autoConnect         : me.getAutoConnect(),
            reconnectionDelayMax: me.getReconnectionDelayMax()
        };

        return options;
    },

    /**
     * @method flush
     * It sends every message given to the websocket, checking first if is there any connection
     * If there's no connection, it enqueues the message and flushes it later
     * @param {String} Data to send
     * @return {Ext.ux.WebSocket} The websocket
     * @private
     */
    safeSend: function (data) {
        var me  = this;
        if (me.isReady()){
            me.socket.emit('new-message',data);
        }else if (me.getKeepUnsentMessages()) {
            me.messageQueue.push(data);
        }

        return me;
    },

    /**
     * @method receiveEventMessage
     * It catches every event-driven messages incoming from the server
     * @param {Object} message Message incoming from the server
     * @private
     */
    receiveEventMessage: function (message) {
        var me      = this,
            lServer = me.getUrl(),
            lStoreId= me.getStoreId(),
            lIdInst = 1,
            lYear   = Global.getYear(),
            v       = Ext.decode(message),
            store   = null,
            model   = null,
            i       = 0;
        try {
            if((v.año == lYear) && (v.id_inst==lIdInst)){
                store   = Ext.getStore(lStoreId);
                model   = store.getModel();
                switch (v.action){
                    case 'create' :
                        for (i = 0; i < v.data.length; i++) {
                            store.insert(0,v.data[i]);
                        }
                        break;
                    case 'update' :
                        for (i = 0; i < v.data.length; i++) {
                            r       = v.data[i];
                            index   = store.find(model.idProperty,r[model.idProperty]);
                            record  = store.getAt(index);
                            record.set(r);
                        }
                        break;
                    case 'destroy' :
                        for (i = 0; i < v.data.length; i++) {
                            r       = v.data[i];
                            index   = store.find(model.idProperty,r[model.idProperty]);
                            record  = store.getAt(index);
                            store.remove(record);
                        }
                        break
                }
                store.commitChanges();
            }
        }
        catch (err) {
            Ext.Error.raise(err);
        }

        //me.close();
    },

    /**
     * @method sendEventMessage
     * It sends event-driven messages to the server
     * @param {String/String[]} events Event(s) to send to the server
     * @param {String/Object} data Message to send to the server, associated to its event(s)
     * @return {Ext.ux.WebSocket} The websocket
     * @private
     */
    sendEventMessage: function (events, data) {
        var me = this;
        me.safeSend(data);
        return me;
    }
});
