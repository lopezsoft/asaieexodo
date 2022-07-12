Ext.define('Admin.store.general.GradosAgrupadosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'GradosAgrupadosStore',
    requires: [
    	'Admin.model.general.GradosAgrupadosModel'
    ],    
    model		: 'Admin.model.general.GradosAgrupadosModel',
    proxy: {
		api: {
			create  : 'General/insert_data',
			read    : 'General/get_select_all',
			update  : 'General/update_data',
			destroy : 'General/delete_data'
		},
		extraParams : {
			pdbTable : 'grados_agrupados'
		}
    }
});
