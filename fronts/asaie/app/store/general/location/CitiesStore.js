/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.CitiesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'CitiesStore',
    pageSize: 1300,
    requires    : [
        'Admin.model.general.CitiesModel'
    ],
    model   : 'Admin.model.general.CitiesModel',
    proxy   : {
		extraParams : {
            pdbTable    : 'cities'
        },
    }
});
