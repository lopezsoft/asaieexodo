/**
 * Created by LOPEZSOFT on 30/12/2015.
 */
Ext.define('Admin.store.general.DesempenosStore', {
    extend: 'Admin.store.base.StoreUrl',

    storeId: 'DesempenosStore',

    fields: [
        {name: 'id'},
        {name: 'desempeno'}
    ],

    proxy: {
        type	: 'ajax',
        url	    : 'c_sql/get_desemp'
    }
});