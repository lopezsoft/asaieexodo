Ext.define('Admin.store.admin.JornSedesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'JornSedesStore',
    requires : [
        'Admin.model.admin.JornSedesModel'
    ],
    model   : 'Admin.model.admin.JornSedesModel',
    proxy: {
        extraParams : {
            pdbTable : 'jornadas_sedes'
        },
        api: {
            create  : 'crud',
            read    : 'headquarters/working-day',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
