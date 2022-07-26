Ext.define('Admin.store.base.StoreApi',{
	extend		: 'Admin.store.base.StoreUrl',
	storeId		: 'StoreApi',
	pageSize	: 15,
    proxy: {
		type	: 'rest',
	    api: {
			create  : 'crud',
			read    : 'crud/index',
			update  : 'crud',
			destroy : 'crud'
		},
	    writer : {
			type 			: 'json',
			rootProperty	: 'records',
			encode 			: true
		}
	}
});
