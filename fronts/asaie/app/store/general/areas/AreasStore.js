Ext.define('Admin.store.general.AreasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AreasStore',
	pageSize	: 60,
    requires: [
        'Admin.model.general.AreasModel'
    ],
    model		: 'Admin.model.general.AreasModel',
    proxy: {
		storeId : 'AreasStore',
        extraParams : {
            pdbTable 	: 'areas',
			order		: '{"area": "ASC"}'
        }
    }
});
