Ext.define('Admin.store.admin.DirGrupoStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'DirGrupoStore',
    proxy: {
        extraParams : {
            pdbTable    : 'dir_grupo',
            pdbGrado    : 0
        },
        api: {
            create  : 'master/insertData',
            read    : 'master/getGroupDirectorByGrade',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    },
    requires: [
        'Admin.model.admin.DirGrupoModel'
    ],
    model   : 'Admin.model.admin.DirGrupoModel'
});