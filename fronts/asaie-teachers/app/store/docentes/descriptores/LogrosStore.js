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
            create  : 'educational-processes/by-teacher',
            read    : 'educational-processes/by-teacher',
            update  : 'educational-processes/by-teacher',
            destroy : 'educational-processes/by-teacher'
        }
    }
});
