Ext.define('Admin.store.admin.ADocentesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ADocentesStore',
    proxy: {
        extraParams : {
            pdbTable : 'docentes',
			order    : '{"apellido1": "ASC", "nombre1": "ASC"}'
        }
    },
    requires: [
        'Admin.model.admin.ADocentesModel'
    ],
    model   : 'Admin.model.admin.ADocentesModel'
});
