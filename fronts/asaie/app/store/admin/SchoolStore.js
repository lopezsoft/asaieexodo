Ext.define('Admin.store.admin.SchoolStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'SchoolStore',
    proxy: {
        api: {
            create  : 'admin/school',
            read    : 'admin/school/read',
            update  : 'admin/school/update',
            destroy : 'admin/school'
        }
    },
    requires: [
        'Admin.model.admin.SchoolModel'
    ],
    model   : 'Admin.model.admin.SchoolModel'
});
