Ext.define('Admin.store.general.AuxGradosAgrupadosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AuxGradosAgrupadosStore',
    requires: [
    	'Admin.model.general.AuxGradosAgrupadosModel'
    ],    
    model		: 'Admin.model.general.AuxGradosAgrupadosModel',
    proxy: {
		api: {
			create  : 'crud',
			read    : 'grades/auxiliary-grades-grouped',
			update  : 'crud',
			destroy : 'crud'
		},
		extraParams : {
			pdbTable : 'aux_grados_agrupados'
		}
    }
});
