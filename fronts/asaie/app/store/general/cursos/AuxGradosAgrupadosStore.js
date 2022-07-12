Ext.define('Admin.store.general.AuxGradosAgrupadosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AuxGradosAgrupadosStore',
    requires: [
    	'Admin.model.general.AuxGradosAgrupadosModel'
    ],    
    model		: 'Admin.model.general.AuxGradosAgrupadosModel',
    proxy: {
		api: {
			create  : 'General/insert_data',
			read    : 'General/get_aux_grados_agrupados',
			update  : 'General/update_data',
			destroy : 'General/delete_data'
		},
		extraParams : {
			pdbTable : 'aux_grados_agrupados'
		}
    }
});
