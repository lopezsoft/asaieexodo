Ext.define('Admin.store.general.GradosAgrupadosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'GradosAgrupadosStore',
    requires: [
    	'Admin.model.general.GradosAgrupadosModel'
    ],    
    model		: 'Admin.model.general.GradosAgrupadosModel',
    proxy: {
		extraParams : {
			pdbTable : 'grados_agrupados'
		}
    }
});
