/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.container.DataListContainer',{
    extend  : 'Ext.container.Container',
    alias   : 'widget.dataListContainer',
    width   : 230,
    layout: {
        type: 'hbox'
    },
    items   : [
        {
            xtype   : 'TextField',
            width   : 70,
            itemId  : 'txtList'
        },
        {
            xtype   : 'buttonBase',
            itemId  : 'btnList',
            iconCls : 'x-fa fa-search',
            tooltip : 'Mostrar la cantidad de registros indicados en la caja de texto.',
            margin  : '0 1 0 1',
            handler : function (btn) {
                var grid    = btn.up('grid'),
                    cn      = btn.up('container'),
                    value   = cn.down('#txtList').getValue(),
                    store   = grid.getStore();

                store.setPageSize(value);
                store.load();
            }
        },
        {
            xtype   : 'buttonBase',
            itemId  : 'btnAll',
            iconCls : 'x-fa fa-search',
            text    : 'Mostrar todo',
            handler : function (btn) {
                var grid    = btn.up('grid'),
                    cn      = btn.up('container'),
                    value   = 0,
                    store   = grid.getStore();

                store.setPageSize(value);
                store.load({
                    params: {
                        // specify params for the first page load if using paging
                        start: 0,
                        limit: 0
                    },
                    callback    : function (rs) {
                        cn.down('#txtList').setValue(store.getTotalCount());
                    }
                });
            }
        }
    ],
    listeners   : {
        afterrender : function( cn, eOpts ){
            var grid    = cn.up('grid');
                store   = grid.getStore(),
                nList   = store.getPageSize(),
                tf      = cn.down('#txtList').setValue(nList);
        }
    }
});
