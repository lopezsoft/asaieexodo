/**
 * Created by LOPEZSOFT on 11/01/2016.
 */
Ext.define('Admin.store.docentes.LogrosEstandarStore',{
    extend: 'Admin.store.base.StoreApi',
    storeId : 'LogrosEstandarStore',
    requires : [
        'Admin.model.docentes.LogrosEstandarModel'
    ],
    model   : 'Admin.model.docentes.LogrosEstandarModel',
    proxy   : {
		type: 'ajax',
        api     : {
            create  : 'educational-processes/by-teacher/create-by-student',
            read    : 'crud',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
