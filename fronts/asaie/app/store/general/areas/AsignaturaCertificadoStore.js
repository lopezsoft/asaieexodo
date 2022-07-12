/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.AsignaturaCertificadoStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AsignaturaCertificadoStore',
    requires: [
        'Admin.model.general.AsignaturaCertificadoModel'
    ],
    model		: 'Admin.model.general.AsignaturaCertificadoModel',
    pageSize    : 15,
    proxy: {
        extraParams : {
            pdbTable : 'asignaturas_certificados'
        },
        api: {
            create  : 'academic/insert_asignaturas_certificados',
            read    : 'academic/get_select_asignaturas_certificados',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});