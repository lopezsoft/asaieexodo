Ext.define('Admin.store.general.GradosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'GradosStore',
    requires : [
        'Admin.model.general.GradosModel'
    ],
    model: 'Admin.model.general.GradosModel',
    proxy: {
		api: {
			create  : 'crud',
			read    : 'grades',
			update  : 'crud',
			destroy : 'crud'
		},
		extraParams	:  {
			pdbTable	: 'grados',
			pdbSede		: 0
		}
    }
});
