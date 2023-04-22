Ext.define('Admin.view.admin.Teachers',{
    extend  : 'Admin.forms.CustomForm',
    alias   : 'widget.teachers',
    showSaveButton  : false,
    controller      : 'admin',
	initComponent : function(){
        var
			me	= Admin.getApplication();
        me.onStore('general.DocumentosStore');
        me.onStore('admin.ADocentesStore');
		me.onStore('general.CitiesStore');
		me.onStore('general.CitiesStore4');
		me.onStore('general.CitiesStore2');
		me.onStore('general.CitiesStore3');
		me.onStore('general.SexoStore');
		me.onStore('general.RHStore');
		me.onStore('general.NivelEnsStore');
		me.onStore('general.AreaEnsStore');
		me.onStore('general.EscalafonStore');
		me.onStore('general.AreaTecnicaStore');
        me.onStore('general.NivelEduStore');
        me.onStore('general.CountryStore');
        this.setTitle(AppLang.getSTitleViewTeachers	());
		this.callParent(arguments);
    },
    modalView   : 'Admin.view.admin.forms.SaveTeacher',
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
        store       : 'ADocentesStore',
        columns     : [
            {
                xtype   : 'customrownumberer',
                width   : 50
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
                dataIndex   : 'documento',
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
							const me = Admin.getApplication(),
								rec = btn.up('form').down('grid').getSelection()[0];

							me.onStore('docs.ImageBrowserStore');
                            Ext.create({
                                xtype           : 'FilesView',
                                pathReadFile    : 'download/teacher/read-documents',
                                pathUploadFile  : 'upload/teacher/upload-documents',
                                textButtonApply : AppLang.getSButtonAcept(),
                                extraParams     : {
                                    pdbTeacherId: rec.get('documento')
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
                xtype 		: 'pagination',
                itemId      : 'pToolbar',
                showPrint   : false
            }
        ]
    }]
});
