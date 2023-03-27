Ext.define('Admin.store.general.SedesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'SedesStore',
    requires : [
        'Admin.model.general.SedesModel'
    ],
    model   : 'Admin.model.general.SedesModel',
    proxy: {
		extraParams : {
			pdbTable    : 'sedes'
		}
    }
});
