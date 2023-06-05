/**
 * Created by LOPEZSOFT on 03/12/2015.
 */
Ext.define('Admin.store.docentes.LogrosStore', {
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'LogrosStore',
    groupField  : 'nombre_proceso',
    pageSize	: 0,
    requires: [
        'Admin.model.docentes.LogrosModel'
    ],
    model		: 'Admin.model.docentes.LogrosModel',
    proxy: {
        extraParams : {
            pdbTable : 'logros_estandares'
        },
        api: {
            create  : 'c_logros/get_logros_insert',
            read    : 'c_logros/get_logros_estandares',
            update  : 'c_logros/get_logros_update',
            destroy : 'master/deleteData'
        }
    }
});
