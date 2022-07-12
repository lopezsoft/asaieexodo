Ext.define('Admin.view.representative.DegreesPerTable',{
    extend  	: 'Admin.base.WindowCrud',
    title   	: 'Grados mesa de votación',
    alias   	: 'widget.degreespertable',
    controller  : 'representative',
	modalView	: 'Admin.view.representative.DegreesPerTableView',
    items   : [
        {
            xtype   : 'customgrid',
            store   : 'DegreesPerTableStore',
            columns : [
                {
                    xtype   : 'rownumberer'
                },
                {
					text        : 'Grado',
                    dataIndex   : 'grado',
                    flex        : 1
                },
                // {
				// 	text        : 'Grupo',
                //     dataIndex   : 'group_name',
                //     width       : 60
                // },
                {
                    dataIndex   : 'table_name',
                    text        : 'Mesa',
                    flex        : 1
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype   : 'toolbarCrud'
                }
            ]
        }
    ]
});
