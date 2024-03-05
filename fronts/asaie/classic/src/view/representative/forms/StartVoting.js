Ext.define('Admin.view.representative.StartVoting',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.startvoting',
    title       : 'Mesas de votación',
    controller  : 'representative',
    scrollable  : true,
    items   : [
        {
            xtype   	: 'customgrid',
            store   	: 'PollingStationsStore',
			selModel	: 'rowmodel',
            plugins		: [
                {
                    ptype : 'gridfilters'
                }
            ],
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
                    dataIndex   : 'table_number',
                    width        : 75,
                    text        : 'Mesa Nº'
                },
                {
					width       : 100,
                    text        : 'Estado',
                    dataIndex   : 'state',
                    renderer    : function (val) {
						let value = '';
						switch ( parseInt(val)) {
                            case 2 :
                                value   = '<p style="color:blue"> <b> ABIERTA </b></p>';
                                break;
                            case 0 :
                                value   = '<p style="color:red"> <b> CERRADA </b></p>';
                                break;
                            default :
                                value   = '<p style="color:green"> <b> ACTIVA </b></p>';
                                break;
                        }

                        return value;
                    }
                },
                {
                    text        : 'H. Inicio',
					width        : 150,
                    dataIndex   : 'start_time',
                },
                {
                    text        : 'H. Cierre',
					dataIndex   : 'closing_time',
					width        : 150,
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
                    store   : 'PollingStationsStore'
                },
                {
                    xtype       : 'toolbarCrud',
                    defaultType : 'customButton',
                    items   : [
                        {
                            text    : 'Abrir mesa',
                            tooltip : 'Abir mesa electoral',
                            itemId  : 'btnOpenVoting',
                            iconCls : 'x-fa fa-external-link',
                            disabled: true,
                            handler : 'onOpenVoting'
                        },
                        {
                            text    : 'Cerrar mesa',
                            itemId  : 'btnCloseVoting',
                            iconCls : 'x-fa fa-sign-out',
                            tooltip : 'Cerrar mesa electoral',
                            disabled: true,
                            handler : 'onCloseVoting'
                        },
                        {
                            xtype       : 'closebutton',
                            iconAlign	: 'left'
                        }
                    ]
                }
            ]
        }
    ]
});
