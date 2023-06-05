Ext.define('Admin.store.estudiantes.StudentsEvaluationsStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'StudentsEvaluationsStore',
    requires : [
        'Admin.model.estudiantes.StudentsEvaluationsModel'
    ],
    model   : 'Admin.model.estudiantes.StudentsEvaluationsModel',
    proxy : {
        extraParams : {
            pdbTable    : 'te_shared_evaluation'
        },
        api: {
            read    : 'students/getStudentsEvaluations',
            update  : 'master/updateData'
        }
    }
});