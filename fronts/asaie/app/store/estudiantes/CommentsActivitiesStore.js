Ext.define('Admin.store.estudiantes.CommentsActivitiesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'CommentsActivitiesStore',
    requires : [
        'Admin.model.estudiantes.MaterialEducativoEstudiantesModel'
    ],
    model   : 'Admin.model.estudiantes.MaterialEducativoEstudiantesModel',
    proxy : {
        extraParams : {
            pdbTable    : 'ta_comments_activities'
        },
        api: {
            create  : '',
            read    : 'students/getCommentsActivities',
            update  : 'master/updateData',
            destroy : ''
        }
    }
});