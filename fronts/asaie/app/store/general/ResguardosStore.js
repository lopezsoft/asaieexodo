Ext.define('Admin.store.general.ResguardosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ResguardosStore',
    pagSize : 500,
    requires: [
    	'Admin.model.general.ResguardosModel'
    ],    
    model		: 'Admin.model.general.ResguardosModel',
    proxy: {
        extraParams : {
            pdbTable : 'resguardos'
        }
    }
});