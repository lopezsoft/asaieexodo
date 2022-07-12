Ext.define('Admin.view.docs.LiveBroadcast', {
    extend: 'Admin.base.CustomWindow',
    alias: 'widget.livebroadcast',
    closable: false,
    iconCls: '',
    constrainHeader: false,
    fixed: true,
    hideShadowOnDeactivate: false,
    animateShadow: true,
    border: false,
    resizable: true,
    bodyBorder: false,
    cls: 'menu-win',
    maximizable: false,
    header: false,
    maximized: true,
    config: {
        task: undefined,
        email: 'soporte@asaie.co',
        displayName: 'ASIAE EXODO',
        subject: 'Sala de pruebas.',
        attached: '',
        weather: 0,
        minutes: 0,
        seconds: 0,
        record: null,
        test: true,
        api: null,
        store: undefined,
        isHost: true,
        isStudent: false,
        roomName: 'meet.asie.co.example'
    },
    defaultListenerScope: true,
    initComponent: function() {
        let me = this;
        me.items = [{
            xtype: 'form',
            ui: 'panel-white',
            layout: 'anchor',
            scrollable: true,
            items: [{
                xtype: 'container',
                id: 'meet'
            }],
            dockedItems: [{
                xtype: 'toolbarSave',
                items: [{
                        xtype: 'label',
                        itemId: 'lbWeather',
                        cls: 'widget-name-text',
                        html: 'Tiempo'
                    },
                    '->',
                    {
                        iconCls: 'fas fa-paperclip',
                        ui: 'header-blue',
                        disabled: Ext.isEmpty(me.getAttached()),
                        tooltip: 'Documento adjunto',
                        href: me.getAttached()
                    },
                    {
                        iconCls: 'fas fa-play-circle',
                        text: 'Iniciar',
                        ui: 'header-green',
                        disabled: !(me.getIsHost()),
                        handler: function() {
                            this.up('window').startTransmission();
                        }
                    }, '-',
                    {
                        iconCls: 'far fa-stop-circle',
                        text: 'Parar',
                        disabled: !(me.getIsHost()),
                        ui: 'header-red',
                        handler: function() {
                            this.up('window').stopTransmission();
                        }
                    }, '-',
                    {
                        xtype: 'closebutton',
                        handler: function() {
                            this.up('window').onCloseWin();
                        }
                    }
                ]
            }]
        }]
        me.callParent();
    },
    listeners: {
        afterrender: function() {
            this.startTransmission();
        }
    },
    onCloseWin: function() {
        let me = this;
        me.stopClock();
        if (me.getTest()) {
            me.stopTransmission();
            me.clearClock();
            me.close();
        } else {
            Ext.Msg.show({
                title: 'Cerrar sala virtual',
                message: (me.getIsHost()) ? 'Desea cerrar  la sesión de la sala virtual?' : 'Desea salir de la sala virtual?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        me.savechanges();
                    }
                }
            });
        }
    },
    runClock: function() {
        var
            me = this,
            clock = me.down('#lbWeather'),
            next = 0,
            count = 0,
            text = 60,
            fin = false,
            min = parseInt(me.getWeather() - 1);
        if (!me.getIsHost()) {
            me.task = Ext.TaskManager.start({
                run: function() {
                    next++;
                    clock.setHtml('Tiempo: ' + ("0" + me.minutes.toString()).slice(-2) + ':' + ("0" + next.toString()).slice(-2));
                    me.seconds++;
                    if (next == 60) {
                        next = 0;
                        me.minutes++;
                        clock.setHtml('Tiempo: ' + ("0" + me.minutes.toString()).slice(-2) + ':' + ("0" + next.toString()).slice(-2));
                        me.seconds = 0;
                    }

                    if (parseInt(me.getMinutes()) >= 60) {
                        me.stopClock();
                        me.stopTransmission();
                        me.savechanges();
                    }
                },
                interval: 1000
            });
        } else {
            me.task = Ext.TaskManager.start({
                run: function() {
                    next++;
                    count = text - next;
                    clock.setHtml('Tiempo restante: ' + ("0" + min.toString()).slice(-2) + ':' + ("0" + count.toString()).slice(-2));
                    me.seconds++;
                    if (next == 60) {
                        min--;
                        count = 0;
                        next = 0;
                        me.minutes++;
                        me.seconds = 0;
                        if (fin) {
                            me.app.showResult('Lamentablemente se ha agotado el tiempo.!');
                            me.stopClock();
                            me.savechanges();
                        }
                    }
                    if (min == 0) {
                        fin = true
                    };
                },
                interval: 1000
            });
        }

    },
    clearClock: function() {
        let me = this;
        me.stopClock();
        me.task = undefined;
    },
    stopClock: function() {
        var
            me = this;
        if (me.getIsHost()) {
            Ext.TaskManager.stop(me.task);
        }
    },
    startTransmission: function() {
        let me = this,
            api = me.getApi(),
            record = me.getRecord(),
            app = Admin.getApplication();
        const domain = 'meet.asaie.co';
        const options = {
            roomName: me.getRoomName(),
            width: '100%',
            height: me.height - 10,
            parentNode: document.querySelector('#meet'),
            devices: {
                audioInput: '<deviceLabel>',
                audioOutput: '<deviceLabel>',
                videoInput: '<deviceLabel>'
            },
            configOverwrite: {
                startWithAudioMuted: true,
                localRecording: {
                    enabled: true,
                    // The recording format, can be one of 'ogg', 'flac' or 'wav'.
                    format: 'wav'
                }
            },
            userInfo: {
                email: me.getEmail(),
                displayName: me.getDisplayName()
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                ENABLE_FEEDBACK_ANIMATION: true,
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'e2ee', 'security', 'localrecording'
                ]
            },
        };
        if (!api) {
            me.setApi(new JitsiMeetExternalAPI(domain, options));
            api = me.getApi();
            api.executeCommand('subject', me.getSubject());
            if (me.getIsHost()) {

                api.on('participantJoined', function() {
                    console.log('participantJoined');
                    console.log(data);
                });
                api.on('participantLeft ', function() {
                    console.log('participantLeft');
                    console.log(data);
                });
                api.on('readyToClose', function() {
                    console.log('readyToClose');
                    console.log(data);
                });

            }
            if (!me.getTest()) {
                let socket = Global.getSocket();
                if (me.getIsHost()) {
                    socket.emit('updateData', {
                        dataName: Global.getDbName(),
                        table: 'tl_live_classes',
                        values: [
                            { transmitting: 1 },
                            { id: record.get('id') }
                        ]
                    }, (err, resp) => {
                        if (err) {
                            app.showResult('Error al iniciar la transmisión de la clase.', 'error');
                            me.stopTransmission();
                            socket.close();
                            me.close();
                            return false;
                        }
                        socket.close();
                    });
                } else {
                    socket.emit('updateData', {
                        dataName: Global.getDbName(),
                        table: 'tl_students_live_classes',
                        values: [
                            { transmitting: 1, isit_read: 1 },
                            { id: record.get('id') }
                        ]
                    }, (err, resp) => {
                        if (err) {
                            app.showResult('Error al iniciar la transmisión de la clase.', 'error');
                            me.stopTransmission();
                            socket.close();
                            me.close();
                            return false;
                        }
                        socket.close();
                    });
                }
            }
            if (!me.task) {
                me.runClock();
            }
        }

    },
    stopTransmission: function() {
        let me = this,
            api = me.getApi();
        if (api) {
            api.executeCommand('hangup');
            if (me.getIsHost()) {
                api.dispose();
            }
            me.setApi(null);
        }
    },
    savechanges: function() {
        let me = this,
            record = me.getRecord(),
            app = Admin.getApplication(),
            store = me.getStore();
        if (me.getTest() || !me.getIsHost()) {
            if (me.getIsStudent()) {
                let socket = Global.getSocket();
                socket.emit('updateData', {
                    dataName: Global.getDbName(),
                    table: 'tl_students_live_classes',
                    values: [
                        { transmitting: 0 },
                        { id: record.get('id') }
                    ]
                }, (err, resp) => {
                    if (err) {
                        app.showResult('Error al guardar la transmisión.', 'error');
                        socket.close();
                        return false;
                    }
                    socket.close();
                    me.stopTransmission();
                    me.clearClock();
                    if (store) {
                        store = Ext.getStore(store);
                        store.reload();
                    }
                    me.close();
                });
            } else {
                me.close();
            }
        } else {
            let socket = Global.getSocket();
            socket.emit('updateData', {
                dataName: Global.getDbName(),
                table: 'tl_live_classes',
                values: [
                    { transmitting: 0, active: 0 },
                    { id: record.get('id') }
                ]
            }, (err, resp) => {
                if (err) {
                    app.showResult('Error al guardar la transmisión.', 'error');
                    socket.close();
                    return false;
                }
                socket.close();
                me.stopTransmission();
                me.clearClock();
                if (store) {
                    store = Ext.getStore(store);
                    store.reload();
                }
                me.close();
            });
        }
    }
});