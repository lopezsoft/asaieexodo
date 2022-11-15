/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.FirmasView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Firmas',
    controller  : 'configuraciones',
    alias       : 'widget.FirmasView',
	defaultFocus    : 'customtextarea',
	store 			: 'FirmasStore',
    items       : [																							 		
        {
            xtype   : 'customform',
			defaultType : 'customtextarea',
            items: [
				{
					fieldLabel  : 'Firma rector(a)/Director(a)',
					name        : 'firma1',
					labelAlign  : 'top'
				},
				{
					fieldLabel  : 'Firma secretario(a)',
					name        : 'firma2',
					labelAlign  : 'top'
				},
				{
					fieldLabel  : 'Firma coordinador(a)',
					name        : 'firma3',
					labelAlign  : 'top'
				},
				{
					fieldLabel  : 'Firma director(a) de grupo',
					name        : 'firma4',
					labelAlign  : 'top'
				},
				{
					xtype	: 'hiddenfield',
					name	: 'firma_escaneada',
					itemId	: 'txtFirm'
				},
				{
					xtype	: 'hiddenfield',
					name	: 'mime',
					itemId	: 'txtMime'
				},
				{
					xtype	: 'customcheckboxfield',
					boxLabel: 'Mostrar firma escaneada',
					name	: 'usar_firma_escan'
				},
				{
					xtype       : 'fieldSet',
					title       : 'Mostrar firmas de:',
					items       : [
						{
							xtype   : 'customcheckboxfield',
							name    : 'firmarector',
							boxLabel: 'Rector(a)'
						},
						{
							xtype   : 'customcheckboxfield',
							name    : 'firmasecre',
							boxLabel: 'Secretario(a)'
						},
						{
							xtype   : 'customcheckboxfield',
							name    : 'firmacoor',
							boxLabel: 'Coordinador(a)'
						},
						{
							xtype   : 'customcheckboxfield',
							name    : 'firmadirgrupo',
							boxLabel: 'Director(a)  de grupo'
						}
					]
				}
            ],
			dockedItems: [{
				xtype	: 'toolbarSave',
				items 	: [
					{
						xtype	: 'facebookButton'
					},
					{
						xtype	: 'youtubeButton'
					},
					'->',
					{
						xtype	: 'customButton',
						ui      : 'facebook',
						text	: 'Firma escaneada',
						iconCls	:'x-fa fa-check',
						handler	: function (btn) {
							var me  = Admin.getApplication();
							me.onStore('docs.ImageBrowserStore');
							var win = Ext.create({
								xtype       : 'FilesView',
								title       : 'Seleccionar imagen para firma Escaneada',
								pathReadFile    : 'download/settings/read-signature',
								pathUploadFile  : 'upload/settings/upload-signature',
								pathDeleteFile  : 'files/settings/delete-signature',
								titlePanelLoad  : 'Subir imagen',
								titlePanelView  : 'Mis imagenes',
								textButtonLoad  : 'Seleccionar una imagen en el equipo',
								textButtonApply : 'Establecer como firma escaneada',
								listeners : {
									afterselect : function (me, r) {
										btn.up('window').down('#txtFirm').setValue(r.get('path_set'));
										btn.up('window').down('#txtMime').setValue(r.get('mime'));
									},
									afterupload : function (me, r) {
										btn.up('window').down('#txtFirm').setValue(r.foto);
										btn.up('window').down('#txtMime').setValue(r.mime);
									},
									cancel  : function (me) {
										btn.up('window').down('#txtFirm').reset();
										btn.up('window').down('#txtMime').reset();
									}
								}
							});
							win.on('apply',function(me){
								win.close();
							});
							win.show();
						}
					},'-',
					{
						xtype		: 'saveButton',
						iconAlign	: 'left'
					},'-',
					{
						xtype		: 'closebutton',
						iconAlign	: 'left'
					}
				]
			}]
        }
    ]
});
