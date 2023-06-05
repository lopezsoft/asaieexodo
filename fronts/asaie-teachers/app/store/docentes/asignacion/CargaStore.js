Ext.define('Admin.store.docentes.CargaStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'CargaStore',
    requires: [
    	'Admin.model.docentes.CargaModel'
    ],    
    model		: 'Admin.model.docentes.CargaModel',
    proxy: {
    	type	: 'ajax',
        url	    : 'c_sql/get_carga_academica'
    }
});

