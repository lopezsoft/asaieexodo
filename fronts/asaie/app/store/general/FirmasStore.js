/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.FirmasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'FirmasStore',
    requires: [
        'Admin.model.general.FirmasModel'
    ],
    model		: 'Admin.model.general.FirmasModel',
    pageSize    : 1,
    proxy: {
        extraParams : {
            pdbTable : 'firmas'
        }
    }
});
