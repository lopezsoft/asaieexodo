/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.PreMatriculaNuevosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'PreMatriculaNuevosStore',
    requires: [
        'Admin.model.general.PreMatriculaNuevosModel'
    ],
    model		: 'Admin.model.general.PreMatriculaNuevosModel',
    pageSize    : 500,
    proxy: {
        extraParams : {
            pdbTable : 'pre_matricula_nuevos'
        },
        api: {
            create  : '',
            read    : 'academic/get_pre_matricula_nuevos',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});