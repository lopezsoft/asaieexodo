/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.PreMatriculaViejosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'PreMatriculaViejosStore',
    requires: [
        'Admin.model.general.PreMatriculaViejosModel'
    ],
    model		: 'Admin.model.general.PreMatriculaViejosModel',
    pageSize    : 500,
    proxy: {
        extraParams : {
            pdbTable : 'pre_matricula_viejos'
        },
        api: {
            create  : '',
            read    : 'academic/get_pre_matricula_viejos',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
