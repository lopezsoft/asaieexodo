
Ext.define('Admin.store.admin.DocentesDirGrupoStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'DocentesDirGrupoStore',
    proxy: {
        extraParams : {
            pdbTable : 'docentes'
        },
        api: {
            create  : 'crud',
            read    : 'teachers/get-by-year',
            update  : 'crud',
            destroy : 'crud'
        }
    },
    requires: [
        'Admin.model.admin.DocentesDirGrupoModel'
    ],
    model   : 'Admin.model.admin.DocentesDirGrupoModel'
});
