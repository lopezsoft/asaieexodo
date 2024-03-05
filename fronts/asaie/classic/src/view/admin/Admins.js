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

				text        : 'Apellidos',
				columns : [
					{
						text        : 'Primer',
						dataIndex   : 'apellido1',
						width       : 120,
						filter      : 'string'
					},{
						text        : 'Segundo',
						dataIndex   : 'apellido2',
						width       : 120,
						filter      : 'string'
					}
				]
			},
			{
				text        : 'Nombres',
				columns : [
					{
						text        : 'Primer',
						dataIndex   : 'nombre1',
						width       : 120,
						filter      : 'string'
					},{
						text        : 'Segundo',
						dataIndex   : 'nombre2',
						width       : 120,
						filter      : 'string'
					}
				]
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
								pathReadFile    : 'files/read',
								pathUploadFile  : 'files/upload',
								textButtonApply : AppLang.getSButtonAcept(),
								extraParams     : {
									belongToId	: rec.get('numero_documento'),
									fileProfile	: 'Admin'
								}
							}).show();
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
