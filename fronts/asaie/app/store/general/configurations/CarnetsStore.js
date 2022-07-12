/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.CarnetsStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'CarnetsStore',
    requires: [
        'Admin.model.general.CarnetsModel'
    ],
    model		: 'Admin.model.general.CarnetsModel',
    proxy: {
        extraParams : {
            pdbTable : 'carnets'
        }
    }
});
