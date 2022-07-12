/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.admin.ADocentesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ADocentesStore',
    proxy: {
        extraParams : {
            pdbTable : 'docentes'
        },
        api: {
            create  : 'master/insertTeachers',
            read    : 'master/getSelectTeachers',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    },
    requires: [
        'Admin.model.admin.ADocentesModel'
    ],
    model   : 'Admin.model.admin.ADocentesModel'
});