Ext.define('Admin.store.general.CitiesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'CitiesStore',
    pageSize: 0,
    requires    : [
        'Admin.model.general.CitiesModel'
    ],
    model   : 'Admin.model.general.CitiesModel',
    proxy   : {
		extraParams : {
			pdbTable    : 'cities'
		},
		api : {
			create : 'crud',
			read : 'cities',
			update : 'crud',
			destroy : 'crud',
		}
    }
});
