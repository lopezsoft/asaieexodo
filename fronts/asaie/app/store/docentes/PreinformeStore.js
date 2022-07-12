/**
 * Created by LOPEZSOFT on 3/06/2016.
 */
Ext.define('Admin.store.docentes.PreinformeStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'PreinformeStore',
    pageSize: 100,
    requires: [
        'Admin.model.docentes.PreinformeModel'
    ],
    model   : 'Admin.model.docentes.PreinformeModel',
    proxy   : {
        extraParams : {
            pdbTable    : 'preinforme'
        },
        api : {
            create  : '',
            read    : 'c_docentes/get_preinforme',
            update  : 'c_docentes/get_update_preinforme',
            destroy : 'master/deleteData'
        },
        timeout : 0
    }
});
