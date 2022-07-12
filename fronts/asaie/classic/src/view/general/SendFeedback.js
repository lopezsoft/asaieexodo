Ext.define('Admin.view.general.SendFeedback',{
    extend      : 'Admin.base.WindowCrud',
    alias  	    : 'widget.sendfeedback',
    config      : {
        url     : '',
        params  : {}
    },
    maxHeight   : 480,
    initComponent   : function(){
        let me = this;
        me.items 	= [
            {
                xtype 	    : 'form',
                ui          : 'panel-white',
                bodyPadding : 10,
                items : [
                    {
                        xtype       : 'customtext',
                        fieldLabel  : 'Titulo del comentario',
                        name        : 'comment_title',
                        allowBlank  : false
                    },
                    {
                        xtype       : 'customhtmleditor',
                        fieldLabel  : 'Escribe tu comentario',
                        height      : 250,
                        name        : 'comment'
                    },
                    {
                        xtype       : 'filefield',
                        name        : 'nfile',
                        fieldLabel  : 'Adjunto',
                        labelWidth  : 50,
                        msgTarget   : 'side',
                        allowBlank  : true,
                        anchor      : '100%',
                        iconCls     : 'fas fa-cloud-upload-alt',
                        buttonText  : 'Seleccionar archivo...'
                    }
                ],
                buttons: [{
                    text        : 'Guardar...',
                    ui          : 'soft-blue',
                    iconCls     : 'fas fa-comment-dots',
                    handler     : function(btn) {
                        let form    = this.up('form').getForm(),
                            values  = form.getValues(),
                            me      = this.up('window'),
                            app     = Admin.getApplication();
                        if(Ext.isEmpty(values.comment) || values.comment.length <= 30){
                            app.showResult('Debe digitar el comentario','error');
                            return;
                        }
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

                        if(form.isValid()) {
                            form.submit({
                                url             : me.getUrl(),
                                params          : me.getParams(),
                                waitMsg         : 'Enviando comentario...',
                                success: function(fp, o) {
                                    app.showResult('El proceso al concluido correctamente.');
                                    me.fireEvent('closed',me);
                                },
                                //progress is [0..1], and event is the underlying HTML 5 progress event.
                                progress: function (action, progress, event) {
                                    Ext.Msg.updateProgress(progress)
                                },
                                failure: function (fp, o) {
                                    let me  = Ext.decode(o.response.responseText);
                                    app.showResult(me.error,'error');
                                }
                            });
                        }
                    }
                }]
            }
        ];
        me.callParent(arguments);
    }
});