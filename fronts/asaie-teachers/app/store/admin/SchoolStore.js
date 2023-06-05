Ext.define('Admin.store.admin.SchoolStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'SchoolStore',
    proxy: {
        api: {
            create  : 'school/create',
            read    : 'school/read',
            update  : 'school/update',
            destroy : 'school/destroy',
        }
    },
    requires: [
        'Admin.model.admin.SchoolModel'
    ],
    model   : 'Admin.model.admin.SchoolModel'
});
