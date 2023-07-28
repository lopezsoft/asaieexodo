Ext.define('Admin.store.admin.TeachersStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'TeachersStore',
    proxy: {
        extraParams : {
            pdbTable : 'docentes',
        },
		api: {
			create  : 'crud',
			read    : 'teachers',
			update  : 'crud',
			destroy : 'crud'
		}
    },
    requires: [
        'Admin.model.admin.ADocentesModel'
    ],
    model   : 'Admin.model.admin.ADocentesModel'
});
