Ext.define('Admin.store.general.CitiesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'CitiesStore',
    pageSize: 1300,
    requires    : [
        'Admin.model.general.CitiesModel'
    ],
    model   : 'Admin.model.general.CitiesModel',
    proxy   : {
		extraParams : {
			pdbTable    : 'cities'
		},
		api : {
			create : 'store',
			read : 'cities',
			update : 'update',
			destroy : 'destroy',
		}
    }
});
