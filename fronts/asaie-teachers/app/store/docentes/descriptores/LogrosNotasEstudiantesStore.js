/**
 * Created by LOPEZSOFT on 13/01/2016.
 */
Ext.define('Admin.store.docentes.LogrosNotasEstudiantesStore', {
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'LogrosNotasEstudiantesStore',
    groupField  : 'nombres',
    pageSize	: 2000,
    requires: [
        'Admin.model.docentes.LogrosNotasEstudiantesModel'
    ],
    model		: 'Admin.model.docentes.LogrosNotasEstudiantesModel',

    proxy: {
        api : {
            create   : 'c_logros/get_delete_logros_estudiantes_all',
            read     : 'c_logros/get_select_logros_estudiantes_all',
            update   : 'c_logros/get_select_logros_estudiantes_all',
            destroy  : 'c_logros/get_delete_logros_estudiantes_all'
        }
    }
});