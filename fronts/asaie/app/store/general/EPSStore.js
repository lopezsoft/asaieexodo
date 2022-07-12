Ext.define('Admin.store.general.EPSStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'EPSStore',
	pageSize	: 100,
    requires: [
    	'Admin.model.general.EPSModel'
    ],    
    model		: 'Admin.model.general.EPSModel',
    proxy: {
		extraParams : {
			pdbTable : 'eps'
		},
		api: {
			create  : 'General/insert_data',
			read    : 'General/get_select_all',
			update  : 'General/update_data',
			destroy : 'General/delete_data'
		}
    }
});
