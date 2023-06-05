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
		}
    }
});
