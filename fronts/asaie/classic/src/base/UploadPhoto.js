Ext.define('Admin.base.UploadPhoto',{
	extend 		: 'Admin.base.CustomWindow',
	alias		: 'widget.uploadphoto',
	maxWidth	: 450,
	maxHeight	: 290,
	title		: 'Fotografia',
    iconCls		: 'icon-cloud',
	config	: {
		urlPhoto: '',  // Propiedad donde se guarda la URL donde se enviará la petición
		extParam: {},  // Propiedad de tipo objeto, donde se guardan parámetros adiciones que se envien en la petición
		store	: '',  // Propiedad donde se guarda el Store que se actualizará con los datos de la foto (solo INSERT).
	},
	items	: [
		{
			xtype 		: 'form',
			border		: false,
			autoScroll	: true,
			layout		: 'anchor',
            defaults: {
                anchor: '100%'
            },
    		bodyPadding	: 1,
    		items		: [
    			{
    				xtype	: 'container',
    				border	: 0,
   					style	: {
   						margin	: '0 auto'
   					},
    				items	: [
    					{    				
							xtype	: 'image',
							title 	: 'Foto',
							width	: 128,
							height	: 128,
							itemId	: 'imgPhoto',
                            style	: {
                                display	: 'block',
								margin	: 'auto'
                            },
							listeners : {
								afterrender : function ( img, eOpts ){
									if(Ext.isEmpty(img.src)){
										img.setSrc('assets/img/avatars/empty.png');
									}
								}
							}
						}
					]
				},
    			{
					xtype		: 'fileuploadfield',
					hideLabel 	: true,
					margin		: '2 0 0 0',
                    allowBlank	: false,
                    msgTarget	: 'side',
                    name		: 'image',
					listeners	: {
                        change : function (tf, value, eOpts) {
							// tf.up('window').down('#imgPhoto').setSrc(value);
                        }
					}
				}
    		],
    		buttons: [{
		        text: 'Subir...',
				iconCls	: 'icon-upload',
				scale	: 'medium',
		        handler: function() {
					let form = this.up('form').getForm(),
						win = this.up('window'),
						xParam = win.getExtParam(),
						url = win.getUrlPhoto(),
						store = win.getStore();
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
					if(form.isValid()){
						xParam	= {
							...xParam,
							...Global.getSchoolParams()
						}
		                form.submit({
		                    url		: url,
		                    params 	: xParam,
		                    waitMsg	: 'Subiendo foto...',
							method	: 'POST',
							headers: {
								'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
							},
		                    success	: function(fp, o) {
		                    	const me	= Admin.getApplication();
		                    	const img 	= win.down('#imgPhoto'),
									imgUrl	= Global.UrlLocation + o.result.foto;
									
								img.setSrc(imgUrl);

								if(!Ext.isEmpty(store)){
									store 	= Ext.getStore(store);
									store.reload();

								}

                                win.close();
		                        me.showResult('Se ha cargado la fotografía correctamente');
		                    },
		                    failure : function (fp, o) {
								const me	= Admin.getApplication();
								me.showResult('No se ha cargado la fotografía',4);
							}
		                });
		            }
		        }
		    }]
		}
	]
});
