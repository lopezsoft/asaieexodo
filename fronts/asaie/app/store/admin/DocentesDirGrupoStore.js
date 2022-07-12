/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.admin.DocentesDirGrupoStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'DocentesDirGrupoStore',
    pageSize  : 0,
    proxy: {
        extraParams : {
            pdbTable : 'docentes'
        },
        api: {
            create  : '',
            read    : 'c_admin/get_select_docentes_dir_grupo',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    requires: [
        'Admin.model.admin.DocentesDirGrupoModel'
    ],
    model   : 'Admin.model.admin.DocentesDirGrupoModel'
});