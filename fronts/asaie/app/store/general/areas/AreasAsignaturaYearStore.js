Ext.define('Admin.store.general.AreasAsignaturaYearStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AreasAsignaturaYearStore',
    requires: [
        'Admin.model.general.AreasAsignaturaModel'
    ],
    model		: 'Admin.model.general.AreasAsignaturaModel',
    proxy: {
        extraParams : {
            pdbTable : 'aux_asignaturas'
        },
        api: {
            create  : 'crud',
            read    : 'courses/subjects-by-year',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
