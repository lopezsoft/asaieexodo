/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.CountryStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId     : 'CountryStore',
    pageSize    : 300,
    requires    : [
        'Admin.model.general.CountryModel'
    ],
    model   : 'Admin.model.general.CountryModel',
    proxy: {
        extraParams : {
            pdbTable    : 'countries',
            order       : '{"country_name":"ASC"}',
            where       : '{"active":"1"}'
        }
    }
});
