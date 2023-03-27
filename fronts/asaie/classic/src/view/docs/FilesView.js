Ext.define('Admin.view.docs.FilesView',{
    extend : 'Ext.window.Window',
    alias   : 'widget.FilesView',
    iconCls     : 'x-fa fa-user',
    uses: [
        'Ext.layout.container.Border',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.TextItem',
        'Ext.layout.container.Fit'
    ],
    defaultFocus    : 'FileField',
    closeAction 	: 'destroy',
    layout			: 'fit',
    modal			: true,
    border			: false,
    config  : {
        pathReadFile    : '',
        pathUploadFile  : '',
        pathDeleteFile  : 'files/delete',
        titlePanelLoad  : AppLang.getSButtonLoadFile(),
        titlePanelView  : AppLang.getSButtonMyFiles(),
        textButtonLoad  : AppLang.getSButtonSelectFile(),
        textButtonApply : AppLang.getSButtonApply(),
        extraParams     : {}
    },
    constructor : function (config) {
		const me = this;
		// Requires a configuration
        if (Ext.isEmpty(config)) {
            Ext.Error.raise('Se necesita una configuración!');
            return false;
        }
        Ext.apply(me.config, config);
        this.callParent(arguments);
        me.on('afterselect', function (me,select) {

        });
        me.on('afterupload',function (me, result) {

        });
        me.on('apply',function (me) {

        });
        me.on('cancel',function (me) {

        });
        return me;
    },
    initComponent: function() {
        var
            me      = this,
            store   = Ext.getStore('ImageBrowserStore'),
            prox    = store.getProxy(),
            api = {};
        this.setTitle(AppLang.getSTitleSelectFile());
        if (Ext.isEmpty(me.getPathReadFile())){
            Ext.Error.raise('Debe proporcionar una ruta para la lectura de los archivos! - pathReadFile');
            return false;
        }
        if (Ext.isEmpty(me.getPathUploadFile())){
            Ext.Error.raise('Debe proporcionar una ruta para la subida de los archivos! - pathUploadFile');
            return false;
        }
        if (Ext.isEmpty(me.getPathDeleteFile())){
            Ext.Error.raise('Debe proporcionar una ruta para la eliminación de los archivos! - pathDeleteFile');
            return false;
        }
        api = {
            create  : '',
            read    : me.pathReadFile,
            update  : '',
            destroy : me.getPathDeleteFile()
        };
        prox.setApi(api);
        prox.setExtraParams(me.extraParams);
        store.load();
        me.items   = [
            {
                xtype       : 'customTab',
                layout      : 'fit',
                tabPosition : 'bottom',
                items: [
                    {
                        title   :  me.getTitlePanelLoad(),
                        xtype   : 'form',
                        iconCls : 'fas fa-cloud-upload-alt',
                        itemId  : 'FrmImg',
                        items: [
                            {
                                xtype: 'container',
                                border: 0,
                                margin: '20 0 0 0',
                                style: {
                                    margin: '0 auto'
                                },
                                items: [
                                    {
                                        xtype: 'image',
                                        title: 'Archivo',
                                        itemId: 'imgPhoto',
                                        imgCls: 'avatar-perfil',
                                        listeners: {
                                            afterrender: function (img, eOpts) {
                                                if (Ext.isEmpty(img.src)) {
                                                    img.setSrc('assets/img/avatars/empty.png');
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                xtype       : 'FileField',
                                hideLabel   : true,
                                margin      : '50 0 0 0',
                                style: {
                                    margin: '0 auto'
                                },
                                allowBlank  : false,
                                ui          : 'facebook',
                                msgTarget   : 'side',
                                name        : 'foto',
                                buttonText  : me.textButtonLoad,
                                listeners   : {
                                    change: function (tf, value, eOpts) {
										const form = tf.up('#FrmImg').getForm(),
											win = tf.up('window'),
											val = form.getValues(),
											rec = form.getRecord(),
											xParam = me.extraParams,
											app = Admin.getApplication(),
											xFoto = Global.getApiUrl() + '/' + me.pathUploadFile;
										Ext.define('Ext.ux.data.Html5Connection', {
                                            override: 'Ext.data.Connection',
                                            overrideAccept: true,
                                            isHtml5Supported: function () {
                                                return typeof FileReader != "undefined";
                                            },
                                            isFormUpload: function (options) {
                                                return !this.isHtml5Supported() && this.callParent(arguments);
                                            },
                                            setOptions: function (options, scope) {
                                                var opts = this.callParent(arguments);
                                                if (this.isHtml5Supported() && options.isUpload && options.form) {
                                                    opts.data = new FormData(options.form);
                                                }
                                                return opts;
                                            },
                                            createRequest: function (options, requestOptions) {
                                                var request = this.callParent(arguments);
                                                if (this.isHtml5Supported() && options.isUpload && options.progress) {

                                                    if (!options.headers) options.headers = {};
                                                    options.headers['Content-Type'] = null;
                                                }

                                                return request;
                                            }
                                        });
                                        Ext.define('Ext.ux.data.Html5Request', {
                                            override: 'Ext.data.request.Ajax',
                                            openRequest: function (options, requestOptions, async, username, password) {
                                                var me = this;
                                                var xhr = this.callParent(arguments);
                                                if (options.isUpload && options.progress) {
                                                    xhr.upload.onprogress = options.progress;
                                                }
                                                return xhr;
                                            },
                                            setupHeaders: function (xhr, options, data, params) {
                                                var acceptHeader = "Accept";
                                                if (this.overrideAccept && options.isUpload) {
                                                    if (!options.headers) options.headers = {};
                                                    options.headers[acceptHeader] = "text/html";
                                                }
                                                return this.callParent(arguments);
                                            }
                                        });
                                        Ext.define('Ext.ux.form.action.Action', {
                                            override: 'Ext.form.action.Action',
                                            createCallback: function () {
                                                var me = this;
                                                var callback = this.callParent();
                                                callback.progress = function (e) {
                                                    var prog = e.loaded / e.total;
                                                    Ext.callback(me.progress, me.scope || me, [me, prog, e]);
                                                };
                                                return callback;
                                            }
                                        });
                                        if (form.isValid()) {
											const {school, profile}	= AuthToken.recoverParams();
											const dt			= new Date();
											xParam.schoolId  	= school.id || 0;
											xParam.profileId  	= profile.id || 0;
											xParam.year  		= school.year || dt.getFullYear();
                                            form.submit({
                                                url     : xFoto,
                                                params  : xParam,
                                                waitMsg : 'Subiendo archivo...',
												headers: {
													'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
												},
                                                success: function (fp, o) {
													const img = win.down('#imgPhoto'),
														btn = win.down('#btnApply'),
														r = o.result,
														imgUrl = 'assets/img/files/128/' + r.format + '.png';
													img.setSrc(imgUrl);
                                                    me.fireEvent('afterupload',me,r);
                                                    btn.setDisabled(false);
                                                    store   = Ext.getStore('ImageBrowserStore');
                                                    store.reload();
                                                    app.showResult('Se ha subido el archivo correctamente');
                                                },
                                                //progress is [0..1], and event is the underlying HTML 5 progress event.
                                                progress: function (action, progress, event) {
                                                    Ext.Msg.updateProgress(progress)
                                                },
                                                failure: function (fp, o) {
													const response	= JSON.parse(o.response.responseText);
                                                    app.onAler(response.error || response.message);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        title   : me.titlePanelView,
                        layout  : 'border',
                        iconCls : 'fas fa-file-upload',
                        ui      : 'panel-white',
                        items: [
                            {
                                region  : 'center',
                                layout: 'fit',
                                items: {
                                    xtype   : 'ImageBrowserView',
                                    scrollable: true,
                                    itemId  : 'Browser',
                                    listeners: {
                                        scope   : this,
                                        selectionchange : this.onIconSelect,
                                        itemdblclick    : this.onIconSelect
                                    }
                                },
                                tbar: [
                                    {
                                        xtype       : 'TextField',
                                        name        : 'filter',
                                        labelWidth  : 50,
                                        flex        : 1,
                                        listeners: {
                                            scope : this,
                                            buffer: 200,
                                            change: this.filter
                                        }
                                    },'-',
                                    {
                                        xtype   : 'customButton',
                                        iconCls : 'x-fa fa-refresh',
                                        handler  : function (btn) {
											const store = Ext.getStore('ImageBrowserStore');
											store.reload();
                                        }
                                    },'-',
                                    {
                                        xtype       : 'deletebutton',
                                        iconAlign   : 'left',
                                        handler     : function (btn) {
                                            const cbtn = btn,
                                                app	 = Admin.getApplication();

                                            Ext.Msg.show({
                                                title	: 'Eliminar archivo',
                                                message	: 'Desea eliminar el archivo?',
                                                buttons	: Ext.Msg.YESNO,
                                                icon	: Ext.Msg.QUESTION,
                                                fn: function(btn) {
                                                    if (btn === 'yes') {
														app.onMsgWait();
														const grid = cbtn.up('window').down('#Browser'),
															records = grid.getSelection()[0];
														const {school, profile}	= AuthToken.recoverParams();
														store 	= grid.getStore() ;
														Ext.Ajax.request({
															url     : Global.getApiUrl() + '/' + me.getPathDeleteFile() + '/1',
															method	: 'DELETE',
															headers: {
																'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
															},
															params: {
																schoolId  	: school.id || 0,
																profileId   : profile.id || 0,
																year        : school.year || dt.getFullYear(),
																pathFile	: records.id,
															},
															success : function (response) {
																app.onMsgClose();
																app.showResult('Se ha realizado la acción de borrado');
																store.reload();
															},
															failure: function (response, opts) {
																app.onMsgClose();
																app.showResult('No se ha realizado la acción de borrado');
																store.reload();
															},
															callback    : function (r, e) {
																app.onMsgClose();
															}
														});
                                                    }
                                                }
                                            });
                                        }
                                    }
                                ]
                            },
                            {
                                xtype   : 'InfoPanel',
                                region  : 'east',
                                split: true
                            }
                        ]
                    }
                ],
                dockedItems: [{
                    xtype: 'toolbarSave',
                    frmBind: false,
                    items: [
                        {
                            xtype: 'facebookButton'
                        },
                        {
                            xtype: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype   : 'saveButton',
                            itemId  : 'btnApply',
                            iconAlign   : 'left',
                            text    : me.textButtonApply,
                            iconCls : 'x-fa fa-check-square-o',
                            handler: function (btn) {
								const app = Admin.getApplication();
								// app.onCloseWin(btn);
                                me.fireEvent('apply',me);
                            }
                        }, '-',
                        {
                            xtype: 'closebutton',
                            itemId: 'btnUndo',
                            iconAlign: 'left',
                            handler: function (btn) {
                                var
                                    app = Admin.getApplication();
                                me.fireEvent('cancel',me);
                                app.onCloseWin(btn);
                            }
                        }
                    ]
                }]
            }
        ];
        this.callParent(arguments);
    },
    /**
     * @private
     * Called whenever the user types in the Filter textfield. Filters the DataView's store
     */
    filter: function(field, newValue) {
		const view = this.down('ImageBrowserView'),
			store = view.getStore(),
			selModel = view.getSelectionModel(),
			selection = selModel.getSelection()[0];

		store.getFilters().replaceAll({
            property: 'name',
            anyMatch: true,
            value   : newValue
        });
        if (selection && store.indexOf(selection) === -1) {
            selModel.clearSelections();
            this.down('InfoPanel').clear();
        }
    },
    /**
     * Called whenever the user clicks on an item in the DataView. This tells the info panel in the east region to
     * display the details of the image that was clicked on
     */
    onIconSelect: function(dataView, selections) {
		const selected = selections[0],
			bd = this.down('#deletebutton');
			bd.setDisabled(!selected);
            const me  = this;
        if (selected) {
            this.down('InfoPanel').loadRecord(selected);
			const btn = this.down('#btnApply');
			btn.setDisabled(false);
            me.fireEvent('afterselect',me,selected);
        }
    },

    /**
     * Fires the 'selected' event, informing other components that an image has been selected
     */
    fireImageSelected: function() {
		const selectedImage = this.down('ImageBrowserView').selModel.getSelection()[0];
		if (selectedImage) {
            this.fireEvent('selected', selectedImage);
            this.hide();
        }
    },

    afterRender: function () {
		const me = this;

		me.callParent(arguments);

        me.syncSize();

        // Since we want to always be a %age of the modalViewort, we have to watch for
        // resize events.
        Ext.on(me.resizeListeners = {
            resize: me.onViewportResize,
            scope: me,
            buffer: 50
        });
    },

    doDestroy: function () {
        Ext.un(this.resizeListeners);

        this.callParent();
    },

    onViewportResize: function () {
        this.syncSize();
    },

    syncSize: function () {
		const width = Ext.Element.getViewportWidth(),
			height = Ext.Element.getViewportHeight();

		// We use percentage sizes so we'll never overflow the screen (potentially
        // clipping buttons and locking the user in to the dialog).

        this.setSize(Math.floor(width * 0.9), Math.floor(height * 0.9));
        this.setXY([ Math.floor(width * 0.05), Math.floor(height * 0.05) ]);
    }
});
