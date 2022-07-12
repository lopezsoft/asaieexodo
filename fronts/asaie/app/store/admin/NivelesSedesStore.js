/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.admin.NivelesSedesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'NivelesSedesStore',
    requires : [
        'Admin.model.admin.NivelesSedesModel'
    ],
    model   : 'Admin.model.admin.NivelesSedesModel',
    proxy: {
        extraParams : {
            pdbTable : 'niveles_sedes'
        },
        api: {
            create  : 'master/insertData',
            read    : 'General/get_select_niveles_sedes',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    }
});
