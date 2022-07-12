Ext.define('Admin.store.docentes.DesempenoStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'DesempenoStore',
    requires: [
        'Admin.model.docentes.DesempenoModel'
    ],
    model		: 'Admin.model.docentes.DesempenoModel',
    proxy: {
        type	: 'ajax',
        url	    : 'c_sql/get_desemp'
    }
});
