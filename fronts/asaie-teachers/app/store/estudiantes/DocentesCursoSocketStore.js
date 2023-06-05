Ext.define('Admin.store.estudiantes.DocentesCursoSocketStore', {
    extend: 'Admin.store.base.StoreUrlSocket',
    storeId : 'DocentesCursoSocketStore',
    fields  : [
        {name : 'asignatura'},
        {name : 'grado'},
        {name : 'grupo'},
        {name : 'jornada'},
        {name : 'sede'}
    ],
    pageSize	: 0,
    proxy: {
        storeId	: 'DocentesCursoSocketStore',
        url     : 'students/get_docentes_curso'
    }
});