Ext.define('Admin.store.estudiantes.StudentsLiveClassesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'StudentsLiveClassesStore',
    requires : [
        'Admin.model.estudiantes.MaterialEducativoEstudiantesModel'
    ],
    model   : 'Admin.model.estudiantes.MaterialEducativoEstudiantesModel',
    proxy : {
        extraParams : {
            pdbTable    : 'tl_students_live_classes'
        },
        api: {
            create  : '',
            read    : 'students/getStudentsLiveClasses',
            update  : 'master/updateData',
            destroy : ''
        }
    }
});
