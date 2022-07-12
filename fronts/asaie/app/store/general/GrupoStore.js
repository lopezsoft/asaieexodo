/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.GrupoStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'GrupoStore',
    fields  : [
        { name : 'grupo'}
    ],
    proxy: {
        url	: 'General/get_grupos'
    }
});