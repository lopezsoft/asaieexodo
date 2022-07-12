/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.PoblacionatendidaStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'PoblacionatendidaStore',
    fields  : [
        { name : 'id'},
        { name: 'nombre_sexo'},
        { name: 'abrev_sexo'}
    ],
    proxy: {
        extraParams: {
            pdbTable: 'sexo'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select_all',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});