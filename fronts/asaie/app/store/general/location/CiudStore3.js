/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.CitiesStore3',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'CitiesStore3',
    pageSize: 1300,
    requires    : [
        'Admin.model.general.CitiesModel'
    ],
    model   : 'Admin.model.general.CitiesModel',
    proxy   : {
        url : 'General/get_ciudades'
    }
});
