/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.CargaStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'CargaStore',
    requires: [
        'Admin.model.general.CargaModel'
    ],
    model		: 'Admin.model.general.CargaModel',
    pageSize  : 60,
    proxy: {
        extraParams : {
            pdbTable : 'cursos'
        },
        api: {
            create  : 'academic/insert_carga',
            read    : 'academic/get_select_carga',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});