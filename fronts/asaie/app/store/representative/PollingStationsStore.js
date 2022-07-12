Ext.define('Admin.store.representative.PollingStationsStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'PollingStationsStore',
    requires: [
        'Admin.model.representative.PollingStationsModel'
    ],
    model   : 'Admin.model.representative.PollingStationsModel',
    proxy   : {
        extraParams : {
            pdbTable    : 'tp_polling_stations'
        }
    }
});
