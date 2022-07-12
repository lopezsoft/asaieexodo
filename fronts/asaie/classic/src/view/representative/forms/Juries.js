Ext.define('Admin.view.representative.Juries',{
    extend      : 'Admin.base.WindowCrud',
    title       : 'Lista de jurados',
    controller  : 'representative',
    alias       : 'widget.juries',
	modalView	: 'Admin.view.representative.JuriesView',
    items       : [
        {
            xtype   : 'customgrid',
            store   : 'JuriesStore',
            columns : [
                {
                    xtype   : 'rownumberer'
                },
                {
                    dataIndex   : 'poling_station_id',
                    text        : 'Mesa',
                    width       : 60
                },
                {
                    dataIndex   : 'name_jury',
                    text        : 'Nombre del jurado',
                    flex        : 2
                },
                {
                    dataIndex   : 'jury_duty',
                    text        : 'Cargo',
                    flex        : 1
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination',
                    store   : 'JuriesStore'
                },
                {
                    xtype   : 'toolbarCrud'
                }
            ]
        }
    ]
});
