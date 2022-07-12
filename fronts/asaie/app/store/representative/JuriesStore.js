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
            create  : 'Master/insertData',
            read    : 'representative/getJuries',
            update  : 'Master/updateData',
            destroy : 'Master/deleteData'
        }
    }
});
