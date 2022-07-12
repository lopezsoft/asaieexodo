/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.SexoStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'SexoStore',
    fields  : [
        {name : 'sexo'}
    ],
    data : [
        {sexo : 'M'},
        {sexo : 'F'}
    ]
});