Ext.define('Admin.store.general.EtniasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'EtniasStore',
    pagSize : 500,
    requires: [
    	'Admin.model.general.EtniasModel'
    ],    
    model		: 'Admin.model.general.EtniasModel',
    proxy: {
    	extraParams : {
            pdbTable : 'etnias'
        }
    }
});