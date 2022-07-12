Ext.define('Admin.view.docs.WebcamView',{
    extend : 'Admin.base.WindowCrud',
    alias   : 'widget.webcamwiew',
    title   : 'Seleccionar un archivo',
    iconCls     : 'x-fa fa-user',
    uses: [
        'Ext.layout.container.Border',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.TextItem',
        'Ext.layout.container.Fit'
    ],
    requires: [
        'Admin.tab.Panel',
        'Admin.store.docs.ImageBrowserStore',
        'Admin.view.docs.InfoPanel',
        'Admin.view.docs.ImageBrowserView'
    ],
    height  : 600,
    width   : 800,
    defaultFocus    : 'FileField',
    config  : {
        pathReadFile    : '',
        pathUploadFile  : '',
        pathDeleteFile  : 'reports/delete_file',
        titlePanelLoad  : 'Subir archivos',
        titlePanelView  : 'Tus archvivos',
        textButtonLoad  : 'Seleccionar un archivo en el equipo',
        textButtonApply : 'Aplicar',
        extraParams     : {}
    },
    constructor : function (config) {
        var me  = this;
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
            api     = {};
        if (Ext.isEmpty(me.getPathReadFile())){
            Ext.Error.raise('Debe proporcinar una ruta para la lectura de los archivos! - pathReadFile');
            return false;
        }
        if (Ext.isEmpty(me.getPathUploadFile())){
            Ext.Error.raise('Debe proporcinar una ruta para la subida de los archivos! - pathUploadFile');
            return false;
        }
        if (Ext.isEmpty(me.getPathDeleteFile())){
            Ext.Error.raise('Debe proporcinar una ruta para la eliminación de los archivos! - pathDeleteFile');
            return false;
        }
        api = {
            create  : '',
            read    : me.pathReadFile,
            update  : '',
            destroy : me.pathDeleteFile
        };
        prox.setApi(api);
        prox.setExtraParams(me.extraParams);
        store.load();
        me.items   = [
            {
                xtype       : 'customTab',
                // layout      : 'fit',
                // defaultType : 'customTab',
                tabPosition: 'bottom',
                items: [
                    // {
                        // items: [
                            {
                                title   :  me.getTitlePanelLoad(),
                                itemId  : 'FrmImg',
								xtype   : 'form',
								layout	: 'hbox',
								defaults: {
									flex: 1
								},
								items:[
									{
										html	:'<video  id="videowebcamasaie" width="512" height="256" autoplay></video>'
									},
									{
										html 	: '<canvas id="canvas" width="328" height="256"></canvas>'
									}
								],
								tbar:[
									{
										xtype	: 'customButton',
										iconCls	: 'x-fa fa-play',
										text	:"Iniciar Cámara Web",
										handler:function(){
											this.up('window').initWebcam();
										}
									},
									{
										xtype	: 'customButton',
										text	: "Capturar",
										iconCls	: 'x-fa fa-camera-retro',
										handler	: function(){
                                            this.up('window').onCapture();
										}
									},
									{
										xtype	: 'customButton',
										text	: "Subir...",
										iconCls	: 'x-fa fa-cloud-upload',
										handler:function(btn){
											var xParam	= {},
												xParam  = me.extraParams,
												app     = Admin.getApplication(),
												url 	= Global.getUrlBase() + me.pathUploadFile,
												canvas 	= document.getElementById("canvas"),
												context = canvas.getContext("2d"),
												data 	= canvas.toDataURL("image/jpeg");
											xParam.foto = data;
											app.onMsgWait('Subiendo...');
											Ext.Ajax.request({
												url		: url,
												timeout	: 60000,
												params	: xParam,
												success	: function(res, o) {
													var r   = Ext.decode(res.responseText);
													me.fireEvent('afterupload',me,r);
													xParam.foto = {};
													store   	= Ext.getStore('ImageBrowserStore');
													store.reload();
													app.showResult('Se ha subido el archivo correctamente');
												},
												failure: function(response, opts) {
													app.onError('server-side failure with status code ' + response.status);
												},
												callback	: function (res, req) {
													app.onMsgClose();
												}
											});
										}
									}
								]
                            },
                            {
                                title   : me.titlePanelView,
                                xtype   : 'panel',
                                layout  : 'border',
                                items: [
                                    {
                                        xtype   : 'panel',
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
                                                fieldLabel  : 'Filtrar',
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
                                                    var
                                                        store   = Ext.getStore('ImageBrowserStore');
                                                    store.reload();
                                                }
                                            },'-',
                                            {
                                                xtype       : 'deletebutton',
                                                iconAlign   : 'left',
                                                handler     : function (btn) {
                                                    var cbtn = btn,
                                                        me	 = Admin.getApplication();

                                                    Ext.Msg.show({
                                                        title	: 'Elimiar datos',
                                                        message	: 'Desea eliminar el archivo?',
                                                        buttons	: Ext.Msg.YESNO,
                                                        icon	: Ext.Msg.QUESTION,
                                                        fn: function(btn) {
                                                            if (btn === 'yes') {
                                                                me.onMsgWait();
                                                                var grid 	= cbtn.up('window').down('#Browser'),
                                                                    records = grid.getSelection();

                                                                    store 	= grid.getStore() ;
                                                                store.remove(records);
                                                                store.sync({
                                                                    success : function (b, o) {
                                                                        me.onMsgClose();
                                                                        me.showResult('Se ha realizado la acción de borrado');
                                                                        store.reload();
                                                                    },
                                                                    failure : function (b, o) {
                                                                        me.onMsgClose();
                                                                        me.showResult('No se ha realizado la acción de borrado');
                                                                        store.reload();
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
                        // ]
                    // }
                ],
                dockedItems: [
                    {
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
                                    var
                                        app = Admin.getApplication();
                                    me.fireEvent('apply',me);
                                    app.onCloseWin(btn);
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
                    }
                ]
            }
        ];
        this.callParent(arguments);
    },

    onCapture   : function(){
        let video   = document.getElementById("videowebcamasaie"),
            canvas  = document.getElementById("canvas");
            context = canvas.getContext("2d");
            context.drawImage(video, 5, 0, 328, 256);
    },

	initWebcam : function(stream){
        let
			video            = document.getElementById('videowebcamasaie'),
            canvas           = document.getElementById('canvas');
        
        // Pedir permisos al Navegador para usar la Webcam
        navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        window.URL = window.URL || 
             window.webkitURL || 
             window.mozURL || 
             window.msURL;
        navigator.getMedia(
            {
              video: true,
              audio: false
            },
            function(stream) {
                console.log(stream);
                if (navigator.mozGetUserMedia) {
                    video.mozSrcObject = stream;
                }else {
                    video.src = window.URL.createObjectURL(stream);
                }
                video.play();
            },
            function(error) {
                console.log("An error occured! " + error);
                Admin.getApplication().onError("Error Capturando el video: ", error.name + ": " + error.message);
            }
        );
        
        video.width = video.offsetWidth;
        video.addEventListener('canplay', function(ev){
            if (!streaming) {
                height = video.videoHeight / (video.offsetWidth/width);
                video.setAttribute('width', video.offsetWidth);
                video.setAttribute('height', height);
                canvas.setAttribute('width', video.offsetWidth);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);       
	},
    /**
     * @private
     * Called whenever the user types in the Filter textfield. Filters the DataView's store
     */
    filter: function(field, newValue) {
        var view = this.down('ImageBrowserView'),
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
    onIconSelect: function(dataview, selections) {
        var selected = selections[0],
            bd  = this.down('#deletebutton');
            bd.setDisabled(!selected),
            me  = this;
        if (selected) {
            this.down('InfoPanel').loadRecord(selected);
            var
                btn = this.down('#btnApply');
            btn.setDisabled(false);
            me.fireEvent('afterselect',me,selected);
        }
    },
    /**
     * Fires the 'selected' event, informing other components that an image has been selected
     */
    fireImageSelected: function() {
        var selectedImage = this.down('ImageBrowserView').selModel.getSelection()[0];
        if (selectedImage) {
            this.fireEvent('selected', selectedImage);
            this.hide();
        }
    }
});
