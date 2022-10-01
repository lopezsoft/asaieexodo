Ext.define('Admin.store.general.AsignaturasStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'AsignaturasStore',
	pageSize: 60,
    requires: [
        'Admin.model.general.AsignaturasModel'
    ],
    model		: 'Admin.model.general.AsignaturasModel',
    proxy: {
        type	: 'ajax',
        url		: 'c_sql/get_matcursos'
    }
});
