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
        }
    }
});

