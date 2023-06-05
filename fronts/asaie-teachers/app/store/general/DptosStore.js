/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.DptosStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'DptosStore',
    pageSize: 60,
    requires    : [
        'Admin.model.general.DptosModel'
    ],
    model   : 'Admin.model.general.DptosModel',
    proxy   : {
        url : 'General/get_departamentos'
    }
});