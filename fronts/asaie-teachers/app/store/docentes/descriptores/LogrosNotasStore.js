/**
 * Created by LOPEZSOFT on 12/01/2016.
 */
Ext.define('Admin.store.docentes.LogrosNotasStore', {
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'LogrosNotasStore',
    requires: [
        'Admin.model.docentes.LogrosModel'
    ],
    model		: 'Admin.model.docentes.LogrosModel',
    proxy: {
       api : {
           create   : 'c_logros/get_select_logros_estudiantes',
           read     : 'c_logros/get_select_logros_estudiantes',
           update   : 'c_logros/get_select_logros_estudiantes',
           destroy  : 'c_logros/get_delete_logros_estudiantes'
       }
    }
});