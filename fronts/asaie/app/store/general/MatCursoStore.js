Ext.define('Admin.store.general.MatCursoStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'MatCursoStore',
    requires: [
        'Admin.model.general.MatCursoModel'
    ],
    model		: 'Admin.model.general.MatCursoModel',
    pageSize  : 0,
    proxy: {
        extraParams : {
            pdbTable    : 'matcurso',
            pdbGrado    : 0
        },
        api: {
            create  : 'crud',
            read    : 'courses/subjects-by-courses',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
