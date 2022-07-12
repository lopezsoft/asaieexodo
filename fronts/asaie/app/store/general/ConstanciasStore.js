Ext.define('Admin.store.general.ConstanciasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'ConstanciasStore',
    requires : [
        'Admin.model.general.ConstanciasModel'
    ],
    model: 'Admin.model.general.ConstanciasModel',
    proxy: {
        extraParams : {
            pdbTable    : 'config_const_cert'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select_cons_cert',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});

