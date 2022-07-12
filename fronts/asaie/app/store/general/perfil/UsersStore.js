Ext.define('Admin.store.general.perfil.UsersStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'UsersStore',
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
            read    : 'login/getUsers',
            update  : 'master/updateData'
            // destroy : 'master/delete_data'
        }
    }
});