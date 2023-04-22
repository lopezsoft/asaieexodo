Ext.define('Admin.store.representative.JuriesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'JuriesStore',
    requires: [
        'Admin.model.representative.JuriesModel'
    ],
    model   : 'Admin.model.representative.JuriesModel',
    proxy   : {
        extraParams : {
            pdbTable    : 'tp_juries'
        },
        api : {
            create  : 'crud',
            read    : 'representative/juries',
            update  : 'crud',
            destroy : 'crud'
        }
    }
})
