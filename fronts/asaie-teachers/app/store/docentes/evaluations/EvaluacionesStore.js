Ext.define('Admin.store.docentes.EvaluacionesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'EvaluacionesStore',
    requires : [
        'Admin.model.docentes.EvaluacionesStudiantesModel'
    ],
    model   : 'Admin.model.docentes.EvaluacionesStudiantesModel',
    proxy : {
        extraParams : {
            pdbTable    : 'te_evaluations'
        },
        api: {
            create  : 'online-evaluations/create',
            read    : 'online-evaluations',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
