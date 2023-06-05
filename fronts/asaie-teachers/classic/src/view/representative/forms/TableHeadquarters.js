Ext.define('Admin.view.representative.TableHeadquarters',{
    extend  	: 'Admin.base.WindowCrud',
    title   	: 'Sedes mesas de votación',
    alias   	: 'widget.tableheadquarters',
    controller  : 'representative',
	modalView	: 'Admin.view.representative.TableHeadquartersView',
    items   : [
        {
            xtype   : 'customgrid',
            store   : 'TableHeadquartersStore',
            columns : [
                {
                    xtype   : 'rownumberer'
                },
                {
                    dataIndex   : 'headquarter_id',
                    text        : 'Mesa',
                    width       : 60
                },
                {
                    dataIndex   : 'sede',
                    text        : 'Sede',
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
