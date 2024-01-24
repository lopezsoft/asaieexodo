Ext.define('Admin.view.academico.inscripciones.FamiliesStudent',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.familiesstudent',
    title   : 'Ficha familiares',
    controller: 'academico',
    initComponent: function () {
        let me  = Admin.getApplication();
        me.onStore('inscripciones.ParentescoFamiliarStore');
        me.onStore('inscripciones.TipoFamiliarStore');
        me.onStore('inscripciones.FamiliesStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewFamilies());
    },
    modalView   : 'Admin.view.academico.inscripciones.forms.SaveFamiliesStudent',
    store       : 'FamiliesStudentStore',
    items       : [
        {
        xtype       : 'customgrid',
        store       : 'FamiliesStudentStore',
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
                text        : 'Número documento',
                dataIndex   : 'document',
                width       : 150
            },
            {
                text        : 'Familiar',
                dataIndex   : 'nombres',
                width       : 300
            },
            {
                text        : 'Teléfono',
                dataIndex   : 'mobile',
                width       : 120
            },
            {
                text        : 'Dirección',
                dataIndex   : 'address',
                width       : 250
            },
            {
                text        : 'Tipo',
                dataIndex   : 'family_type_name',
                width       : 130
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
                        xtype   : 'addButton',
                        itemId  : 'addFamilie',
                        text    : 'Crear familiares',
                        handler : 'onFamilies'
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
