/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.admin.AdminStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'AdminStore',
    proxy: {
        extraParams : {
            pdbTable : 'administrativos'
        },
        api: {
            create  : 'master/insertData',
            read    : 'master/getSelectAdmin',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    },
    requires: [
        'Admin.model.admin.AdminModel'
    ],
    model   : 'Admin.model.admin.AdminModel'
});