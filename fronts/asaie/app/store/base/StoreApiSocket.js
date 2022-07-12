Ext.define('Admin.store.base.StoreApiSocket',{
	extend		: 'Admin.store.base.StoreUrlSocket',
    proxy: {
		type	: 'socketio',
		storeId	: 'StoreApiSocket',
	    api: {
			create  : 'master/insertData',
			read    : 'master/getTable',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		},
	    writer : {
			type 			: 'json',
			rootProperty	: 'records',
			encode 			: true
		}
	}
});
