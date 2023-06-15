/**
 * Created by LOPEZSOFT on 13/01/2016.
 */
Ext.define('Admin.store.docentes.LogrosNotasEstudiantesStore', {
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'LogrosNotasEstudiantesStore',
    groupField  : 'nombres',
    pageSize	: 0,
    requires: [
        'Admin.model.docentes.LogrosNotasEstudiantesModel'
    ],
    model		: 'Admin.model.docentes.LogrosNotasEstudiantesModel',

    proxy: {
        api : {
            create   : 'crud',
            read     : 'educational-processes/by-students',
            update   : 'crud',
            destroy  : 'crud'
        }
    }
});
