Ext.define('Admin.store.general.perfil.UserStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'UserStore',
    requires: [
        'Admin.model.general.perfil.UserModel'
    ],
    model   : 'Admin.model.general.perfil.UserModel',
    proxy   : {
        extraParams : {
            pdbTable    : 'users'
        },
        api: {
            // create  : 'master/insertData',
            read    : 'login/getCurrentUser',
            update  : 'master/updateData'
            // destroy : 'master/delete_data'
        }
    }
});