Ext.define('Admin.view.academico.AreasForm',{
    extend  : 'Admin.form.FormBase',
    alias   : 'widget.areas',
    xtype   : 'areas',
    requires: [
        'Admin.store.general.AreasStore'
    ],
    controller: 'academico',
    initComponent: function () {
        Admin.getApplication().onStore('general.AreasStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewAreas());
    },
    modalView       : 'Admin.view.academico.AreasView',
    showSaveButton  : true,
    showUndoButton  : true,
    store           : 'AreasStore',
    items   : [{
        xtype       : 'customgrid',
		plugins		: [
			{
				ptype: 'rowexpander',
				rowBodyTpl : new Ext.XTemplate(
					'<p><b>Nombre:</b> {area}</p>'
				)
			},
			{
				ptype			: 'gridSearch',
				readonlyIndexes	: ['note'],
				disableIndexes	: ['pctChange'],
				minChars		: 1,
				mode            : 'local',
				flex			: 1,
				autoFocus		: false,
				independent		: true
			}
		],
        iconCls     : '',
        store       : 'AreasStore',
        syncHeight  : true,
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Orden',
                dataIndex   : 'ordenar',
                width       : 80
            },
            {
                text        : 'Nombre del área',
                dataIndex   : 'area',
                width       : 300,
                filter      : 'string'
            },
            {
                text        : 'Abreviatura',
                dataIndex   : 'abrev',
                width       : 100,
                filter      : 'list'
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Activa',
                dataIndex   : 'estado',
                width       : 60
            }
        ],
        dockedItems : [
            {
                xtype   : 'toolbarCrud',
                items   : [
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
                itemId		: 'pToolbar'
            }
        ]
    }]
});
