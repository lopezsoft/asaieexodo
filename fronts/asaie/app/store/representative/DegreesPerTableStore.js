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
            create  : 'crud',
            read    : 'polling-station/assigned-courses',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
