Ext.define('Admin.store.general.CargaStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'CargaStore',
    requires: [
        'Admin.model.general.CargaModel'
    ],
    model		: 'Admin.model.general.CargaModel',
    pageSize  : 60,
    proxy: {
        extraParams : {
            pdbTable : 'cursos'
        },
        api: {
            create  : 'crud',
            read    : 'courses',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
