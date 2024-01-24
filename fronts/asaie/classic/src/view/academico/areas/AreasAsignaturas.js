Ext.define('Admin.view.academico.AreasAsignaturas',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.areasAsignaturas',
    controller : 'academico',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewAreas());
    },
    config  : {
        record : null
    },
    buildWindow: function () {
        this.winObject = Ext.create('Admin.view.academico.AreasAsignaturasView');
    },
    showWindow: function (btn) {
		let ts = this,
			data = ts.down('grid').getSelection()[0],
			form = [];
		if (!ts.getWinObject()) {
            ts.buildWindow();
        }
        form = ts.winObject.down('form');
        if (btn.itemId === 'editButton') {
            form.loadRecord(data);
        } else {
            form.reset(true);
        }
        ts.winObject.setRecord(ts.getRecord());
        ts.winObject.show();
    },
    store: 'AreasAsignaturaStore',
    items   : [{
        xtype       : 'customgrid',
        selModel    : 'rowmodel',
        plugins		: [
            {
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate(
                    '<p><b>Nombre:</b> {nombre}</p>'
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
        store       : 'AreasAsignaturaStore',
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Área',
                dataIndex   : 'area',
                width       : 250
            },
            {
                text        : 'Asignatura',
                dataIndex   : 'asignatura',
                width       : 250
            },
            {
                text        : 'Año',
                dataIndex   : 'year',
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
