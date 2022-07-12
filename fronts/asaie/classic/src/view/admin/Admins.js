Ext.define('Admin.view.admin.Admins',{
    extend  : 'Admin.forms.CustomForm',
    alias   : 'widget.admins',
    showSaveButton  : false,
    controller      : 'admin',
    initComponent: function () {
        var
            me = Admin.getApplication();
        me.onStore('admin.AdminStore');
        me.onStore('general.DocumentosStore');
        me.onStore('general.CitiesStore');
        me.onStore('general.CitiesStore2');
        me.onStore('general.SexoStore');
        me.onStore('general.RHStore');
        me.onStore('general.CountryStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewAdmin());
    },
    modalView   : 'Admin.view.admin.forms.SaveAdmin', 
    items   : [{
        xtype       : 'customgrid',
		plugins		: [
			{
				ptype			: 'gridSearch',
				readonlyIndexes	: ['note'],
				disableIndexes	: ['pctChange'],
				mode            : 'local',
				flex			: 1,
				autoFocus		: false,
				independent		: true
			}
		],
        store       : 'AdminStore',
        columns     : [
            {
                xtype   : 'rownumberer'
            },
            {
                text        : 'Apellidos y nombres',
                dataIndex   : 'admin',
                width       : 300,
                filter      : 'string'
            },
            {
                text        : 'Documento',
                dataIndex   : 'numero_documento',
                width       : 120,
                filter      : 'string'
            },
            {
                text        : 'Dirección',
                dataIndex   : 'direccion',
                width       : 250
            },
            {
                text        : 'Sexo',
                dataIndex   : 'sexo',
                filter      : 'list',
                width       : 65
            },
            {
                text        : 'Fecha de nacimiento',
                dataIndex   : 'fecha_nacimiento',
                width       : 180
            },
            {
                text        : 'Edad',
                dataIndex   : 'edad',
                width       : 65
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Activo',
                dataIndex   : 'estado',
                width       : 80,
                disabled    : true
            }
        ],
        dockedItems : [
            {
                xtype   : 'toolbarCrud',
                items   : [
                    '->',
					{
						xtype       : 'customButton',
						tooltip     : AppLang.getSToolTipDigitalDocuments(),
						itemId      : 'btnDocDig',
						disabled  	: true,
						iconCls     : 'x-fa fa-book',
						handler     : function (btn) {
							var me  = Admin.getApplication(),
								rec = btn.up('form').down('grid').getSelection()[0];
								me.onStore('docs.ImageBrowserStore');
							Ext.create({
								xtype       	: 'FilesView',
								pathReadFile    : 'c_admin/read_files_dig',
								pathUploadFile  : 'c_admin/upload_files_dig',
								textButtonApply : AppLang.getSButtonAcept(),
								extraParams     : {
									pdbDocumento: rec.get('numero_documento')
								}
							}).show();
						}
					},'-',
					{
						xtype       : 'customButton',
						tooltip     : 'Imagenes',
						itemId      : 'btnWebcam',
						disabled  	: true,
						iconCls     : 'x-fa fa-picture-o',
						handler     : function (btn) {
							var me  = Admin.getApplication(),
								view= btn.up('window') || btn.up('form'),
								rec = btn.up('form').down('grid').getSelection()[0];
								me.onStore('docs.ImageBrowserStore');
								store   = view.down('grid').getStore();
							Ext.create({
								xtype           : 'FilesView',
								title           : 'Imagenes',
								pathReadFile    : 'c_admin/read_images',
								pathUploadFile  : 'c_admin/upload_images',
								titlePanelLoad  : 'Capturar',
								titlePanelView  : 'Mis imágenes',
								textButtonApply : 'Aceptar',
								extraParams     : {
									pdbDocumento: rec.get('numero_documento')
								}
							}).show().on('afterselect',function (me, select) {
								rec.set('foto',select.data.path_set);
							}).on('apply',function (me) {
								store.sync();
								this.close();
							}).on('cancel',function (me) {
								store.rejectChanges();
							});
						}
					},'-',
					{
                        xtype   : 'addButton'
                    },'-',
                    {
                        xtype   : 'editButton'
                    },'-',
                    {
                        xtype   : 'deletebutton'
                    },'-',
                    {
                        xtype   : 'closebutton'
                    }
                ]
            },
            {
                xtype 		: 'pagination'
            }
        ]
    }]
});
