Ext.define('Admin.store.admin.DirGrupoStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'DirGrupoStore',
    proxy: {
        extraParams : {
            pdbTable    : 'dir_grupo',
            pdbGrado    : 0
        },
        api: {
            create  : 'crud',
            read    : 'group-director/getGroupDirectorByGrade',
            update  : 'update',
            destroy : 'crud'
        }
    },
    requires: [
        'Admin.model.admin.DirGrupoModel'
    ],
    model   : 'Admin.model.admin.DirGrupoModel'
});
