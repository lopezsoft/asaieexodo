Ext.define('Admin.store.estudiantes.StudentsActivitiesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'StudentsActivitiesStore',
    requires : [
        'Admin.model.estudiantes.MaterialEducativoEstudiantesModel'
    ],
    model   : 'Admin.model.estudiantes.MaterialEducativoEstudiantesModel',
    proxy : {
        extraParams : {
            pdbTable    : 'ta_shared_online_activities'
        },
        api: {
            create  : '',
            read    : 'students/getStudentsActivities',
            update  : 'master/updateData',
            destroy : ''
        }
    }
});
