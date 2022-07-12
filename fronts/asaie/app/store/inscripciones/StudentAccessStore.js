Ext.define('Admin.store.inscripciones.StudentAccessStore',{
    extend  : 'Admin.store.base.StoreApi',
	storeId : 'StudentAccessStore',
    proxy: {
        extraParams : {
            pdbTable : 'student_access'
        },
        api: {
            create  : 'master/insertData',
            read    : 'academic/getStudentAccess',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    },
    requires: [
        'Admin.model.inscripciones.StudentAccessModel'
    ],
    model   : 'Admin.model.inscripciones.StudentAccessModel'
});