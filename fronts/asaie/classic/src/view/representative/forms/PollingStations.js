Ext.define('Admin.view.representative.PollingStations',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.pollingstations',
    title       : 'Mesas de votación',
    controller  : 'representative',
	modalView	: 'Admin.view.representative.PollingStationsView',
	store   	: 'PollingStationsStore',
    items   : [
        {
            xtype   : 'customgrid',
            store   : 'PollingStationsStore',
            columns : [
                {
                    xtype   : 'rownumberer'
                },
                {
                    dataIndex   : 'table_name',
                    flex        : 2,
                    text        : 'Nombre de la mesa'
                },
                {
					text        : 'Ubicación geográfica o dirección',
					flex        : 1,
					allowBlank	: true,
                    dataIndex   : 'table_location',
                },
                {
                    text        : 'Mesa Nº',
					width        : 75,
                    dataIndex   : 'table_number',
                },
                {
                    text        : 'Activa',
                    dataIndex   : 'state',
                    width       : 70,
                },
                {
					text        : 'Año',
					width        : 55,
                    dataIndex   : 'year',
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination',
                },
                {
                    xtype   : 'toolbarCrud'
                },
                {
                    xtype       : 'toolbarCrud',
                    itemId      : 'ToolCrudSede',
                    defaultType : 'customButton',
                    items   : [
                        {
                            text    : 'Sedes asignadas',
                            iconCls : 'x-fa fa-home',
							itemId	: 'dtnHeadquarter',
                            disabled: true,
                            handler : 'onCreateHeadquarters'
                        },'-',
                        {
                            text    : 'Jurados',
                            iconCls : 'x-fa fa-users',
							itemId	: 'btnJury',
                            disabled: true,
                            handler : 'onCreateJuries'
                        },'-',
						{
							xtype   : 'customButton',
							iconCls : 'x-fa fa-users',
							text    : 'Cursos asignados',
							itemId  : 'btnGrades',
							handler : 'onCreateDegreesPerTable',
							disabled: true
						},
                    ]
                }
            ]
        }
    ]
});
