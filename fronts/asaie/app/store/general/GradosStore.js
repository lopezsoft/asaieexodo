Ext.define('Admin.store.general.GradosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'GradosStore',
    requires : [
        'Admin.model.general.GradosModel'
    ],
    model: 'Admin.model.general.GradosModel',
    proxy: {
		api: {
			create  : 'master/insertData',
			read    : 'master/getGrades',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		},
		extraParams	:  {
			pdbTable	: 'grados',
			pdbSede		: 0
		}
    }
});
