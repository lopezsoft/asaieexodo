/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.admin.JornSedesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'JornSedesStore',
    requires : [
        'Admin.model.admin.JornSedesModel'
    ],
    model   : 'Admin.model.admin.JornSedesModel',
    proxy: {
        extraParams : {
            pdbTable : 'jornadas_sedes'
        },
        api: {
            create  : 'master/insertData',
            read    : 'General/get_select_jorn_sedes',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    }
});
