Ext.define('Admin.base.WinFoto',{
	extend 	: 'Admin.base.CustomWindow',
	alias	: 'widget.WinFoto',
	width	: 450,
	height	: 400,
	title	: 'Fotografia',
	modal	: true,
	urlPhoto: '',  // Propiedad donde se guarda la URL donde se envirá la petición
	extParam: {},  // Propiedad de tipo objeto, donde se guardan parametros adiciones que se envien en la petición 
	store	: '',  // Propiedad donde se guarda el Store que se actualizará con los datos de la foto (solo INSERT).
	requires: [
		'Admin.field.FileField'
	],
	items	: [
		{
			xtype 		: 'form',
			border		: false,
			autoScroll	: true,
			layout		: 'anchor',
    		bodyPadding	: 1,
    		items		: [
    			{
    				xtype	: 'container',
    				width	: '100%',
    				height	: '100%',
    				border	: 0,
   					style	: {
   						margin	: '0 auto'
   					},
    				items	: [
    					{    				
							xtype	: 'image',
							title 	: 'Fotografía',
							width	: '100%',
							height	: '100%',
							itemId	: 'imgPhoto',
							listeners : {
								afterrender : function ( img, eOpts ){
									if(Ext.isEmpty(img.src)){
										img.setSrc('resources/img/foto.png');
									}
								}
							}
						}
					]
				},
				{
					xtype		: 'TextField',
					name		: 'nombre_doc',
					fieldLabel	: 'Nombre del documento'
				},
    			{
					xtype		: 'FileField',
					hideLabel 	: true,
					margin		: '2 0 0 0'
				}
    		],
    		buttons: [{
		        text: 'Subir...',
				iconCls	: 'icon-upload',
				scale	: 'medium',
		        handler: function() {
		            var form 	= this.up('form').getForm(),
		            	win		= this.up('window'),
						val		= form.getValues(),
						rec		= form.getRecord(),
		            	xParam	= win.extParam,
		            	xFoto 	= win.urlPhoto,
		            	store	= win.store;

		            if(form.isValid()){
		                form.submit({
		                    url: xFoto,
		                    params : xParam,
		                    waitMsg: 'Subiendo foto...',
		                    success: function(fp, o) {
		                    	
		                    	var img 	= win.down('#imgPhoto'),
									imgUrl	="data:"+o.result.mime+";base64,"+o.result.foto;									
									
								img.setSrc(imgUrl);
								
								if(!Ext.isEmpty(store)){
									store 	= Ext.getStore(store);
									record 	= store.getAt(0);
									
									record.set('foto',o.result.foto);
									record.set('mime',o.result.mime);
									
								}
								
								
		                        Ext.Msg.alert('Alerta','Se ha cargado la fotografía correctamente');
		                    },
		                    failure : function (fp, o) {
								Ext.Msg.alert('ERRORO','No se ha cargado la fotografía');
							}
		                });
		            }
		        }
		    }]
		}
	]
});