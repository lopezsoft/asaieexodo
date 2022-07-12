Ext.define('Admin.store.base.StoreApi',{
	extend		: 'Admin.store.base.StoreUrl',
	storeId		: 'StoreApi',
	pageSize	: 100,
    proxy: {
		type	: 'rest',
	    api: {
			create  : 'admin/master/store',
			read    : 'admin/master/index',
			update  : 'admin/master/update',
			destroy : 'admin/master/destroy'
		},
	    writer : {
			type 			: 'json',
			rootProperty	: 'records',
			encode 			: true
		}
	}
});
