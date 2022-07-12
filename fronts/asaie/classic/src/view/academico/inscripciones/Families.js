Ext.define('Admin.view.academico.inscripciones.Families',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.families',
    controller: 'academico',
    initComponent: function () {
        let me = Admin.getApplication();
        me.onStore('inscripciones.FamiliesStore');
        me.onStore('general.DocumentosStore');
        me.onStore('general.CountryStore');
        me.onStore('general.CitiesStore');
        me.onStore('general.CitiesStore2');
        me.onStore('general.CitiesStore3');
        me.onStore('general.RHStore');
        me.onStore('general.PoblacionatendidaStore');
        me.onStore('inscripciones.ParentescoFamiliarStore');
        me.onStore('inscripciones.TipoFamiliarStore');
        this.setTitle(AppLang.getSTitleViewFamilies());
        this.callParent(arguments);
    },
    modalView   : 'Admin.view.academico.inscripciones.forms.FamiliesForm',
    store       : 'FamiliesStore',
    showSaveButton : false,
    items   : [{
        xtype       : 'customgrid',
        store       : 'FamiliesStore',
        selModel    : 'rowmodel',
        syncHeight  : false,
		plugins		: [
			{
				ptype: 'rowexpander',
				rowBodyTpl : new Ext.XTemplate(
					'<p><b>Familiares:</b> {nombres}</p>'
				)
			},
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
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Nº documento',
                align       : 'right',
                dataIndex   : 'document',
                width       : 150
            },
            {
                text    : 'Nombres y apellidos',
                columns : [
                    {
                        dataIndex   : 'name1',
                        width       : 100
                    },
                    {
                        dataIndex   : 'name2',
                        width       : 100
                    },
                    {
                        dataIndex   : 'lastname1',
                        width       : 100
                    },
                    {
                        dataIndex   : 'lastname2',
                        width       : 100
                    }
                ]
            },            
            {
                text        : 'Dirección',
                dataIndex   : 'address',
                width       : 250
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
                xtype 		: 'pagination'
            }
        ]
    }]
});
