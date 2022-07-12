Ext.define('Admin.store.docentes.EstudiantesStore',{
    extend      : 'Admin.store.base.StoreUrl',
    storeId     : 'EstudiantesStore',
    pageSize    : 0,
    requires    : [
        'Admin.model.docentes.EstudiantesModel'
    ],
    model   : 'Admin.model.docentes.EstudiantesModel',
    proxy   : {
        url : 'General/get_select_estudiantes'
    }
});