Ext.define('Admin.store.general.ConfiguracionesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ConfiguracionesStore',
    requires: [
        'Admin.model.general.ConfiguracionesModel'
    ],
    model		: 'Admin.model.general.ConfiguracionesModel',
    pageSize    : 10,
    proxy: {
        extraParams : {
            pdbTable : 'config001'
        }
    }
});
