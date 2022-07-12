/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.SedesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'SedesStore',
    requires : [
        'Admin.model.general.SedesModel'
    ],
    model   : 'Admin.model.general.SedesModel',
    proxy: {
        extraParams : {
            pdbTable : 'sedes'
        }
    }
});