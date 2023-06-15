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
		type	: 'ajax',
        extraParams : {
            pdbTable    : 'preinforme'
        },
        api : {
            create  : 'crud',
            read    : 'academic-notes/pre-report',
            update  : 'academic-notes/pre-report',
            destroy : 'crud'
        },
        timeout : 0
    }
});
