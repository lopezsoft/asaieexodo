/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.ConfiguracionBoletinStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ConfiguracionBoletinStore',
    requires: [
        'Admin.model.general.ConfiguracionBoletinModel'
    ],
    model		: 'Admin.model.general.ConfiguracionBoletinModel',
    pageSize    : 1,
    proxy: {
        extraParams : {
            pdbTable : 'configboletin'
        }
    }
});
