/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.EncabezadoReportesView',{
    extend          : 'Admin.base.WindowCrud',
    controller      : 'configuraciones',
    alias           : 'widget.encabezadoreportes',
    defaultFocus    : 'customhtmleditor',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Encabezado de reportes - '+ Global.getYear());
    },
    config      : {
        record  : null
    },
    store       : 'EncabezadoReportesStore',
    items       : [
        {
            xtype           : 'customform',
            store           : 'EncabezadoReportesStore',
            defaultFocus    : 'customhtmleditor',
            defaultType     : 'customhtmleditor',
            items: [
                {
                    xtype       : 'customtext',
                    fieldLabel  : 'Logo escolar',
                    name        : 'logo',
                    readOnly    : true,
                    itemId      : 'logo'
                },
                {
                    xtype       : 'customtext',
                    fieldLabel  : 'Escuado',
                    name        : 'escudo',
                    readOnly    : true,
                    itemId      : 'escudo'
                },
                {
                    xtype       : 'hidden',
                    name        : 'mime',
                    itemId      : 'mime'
                },
                {
                    xtype       : 'hidden',
                    name        : 'mime_esc',
                    itemId      : 'mime_esc'
                },
                {
                    name        : 'encabezado',
                    fieldLabel  : 'Encabezado',
                    labelAlign  : 'top',
                    height      : 250
                },
                {
                    name        : 'pie',
                    labelAlign  : 'top',
                    fieldLabel  : 'Pie de página',
                    height      : 160
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
						text	: 'Escudo',
						iconCls	:'x-fa fa-check',
						handler	: function (btn) {
                            var me  = Admin.getApplication(),
                                ts  = btn.up('window');
							me.onStore('docs.ImageBrowserStore');
							var winApp = Ext.create({
								xtype           : 'FilesView',
								title           : 'Seleccionar escudo',
								pathReadFile    : 'general/readSchoolLogo',
								pathUploadFile  : 'general/uploadSchoolLogo',
								titlePanelLoad  : 'Subir imagen',
								titlePanelView  : 'Mis imagenes',
								textButtonLoad  : 'Seleccionar una imagen en el equipo',
								textButtonApply : 'Establecer como  escudo',
								listeners : {
									afterselect : function (me, r) {
										ts.down('#escudo').setValue(r.get('path_set'));
										ts.down('#mime_esc').setValue(r.get('mime'));
									},
									afterupload : function (me, r) {
										ts.down('#escudo').setValue(r.foto);
										ts.down('#mime_esc').setValue(r.mime);
									},                                    
									cancel  : function (me) {
										ts.down('#escudo').reset();
										ts.down('#mime').reset();
									}
								}
                            });
                            winApp.on('apply', function(me){
                                winApp.close();
                            });
							winApp.show();
						}
					},'-',
					{
						xtype	: 'customButton',
						ui      : 'facebook',
						text	: 'Logo Escolar',
						iconCls	:'x-fa fa-check',
						handler	: function (btn) {
                            var me  = Admin.getApplication(),
                                ts  = btn.up('window');
							me.onStore('docs.ImageBrowserStore');
							var winApp = Ext.create({
								xtype           : 'FilesView',
								title           : 'Seleccionar logo',
								pathReadFile    : 'general/readSchoolLogo',
								pathUploadFile  : 'general/uploadSchoolLogo',
								titlePanelLoad  : 'Subir imagen',
								titlePanelView  : 'Mis imagenes',
								textButtonLoad  : 'Seleccionar una imagen en el equipo',
								textButtonApply : 'Establecer como  logo escolar',
								listeners : {
									afterselect : function (me, r) {
										ts.down('#logo').setValue(r.get('path_set'));
										ts.down('#mime').setValue(r.get('mime'));
									},
									afterupload : function (me, r) {
										ts.down('#logo').setValue(r.foto);
										ts.down('#mime').setValue(r.mime);
									},                                    
									cancel  : function (me) {
										ts.down('#logo').reset();
										ts.down('#mime').reset();
									}
								}
                            });
                            winApp.on('apply', function(me){
                                winApp.close();
                            });
							winApp.show();
						}
					},'-',
					{
						xtype		: 'saveButton'
					},'-',
					{
						xtype		: 'closebutton'
					}
				]
			}]
        }
    ]
});