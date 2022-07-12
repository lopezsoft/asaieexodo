Ext.define('Admin.store.representative.DegreesPerTableStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'DegreesPerTableStore',
    requires: [
        'Admin.model.representative.DegreesPerTableModel'
    ],
    model   : 'Admin.model.representative.DegreesPerTableModel',
    proxy   : {
        extraParams : {
          pdbTable  : 'tp_degrees_per_table'
        },
        api : {
            create  : 'master/insertData',
            read    : 'representative/getDegreesPerTable',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    }
});
