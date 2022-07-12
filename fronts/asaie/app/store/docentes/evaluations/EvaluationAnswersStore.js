Ext.define('Admin.store.docentes.EvaluationAnswersStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'EvaluationAnswersStore',
    requires : [
        'Admin.model.docentes.RespuestasEvaluacionModel'
    ],
    model   : 'Admin.model.docentes.RespuestasEvaluacionModel',
    proxy : {
		typeData: 'Ajax',
        extraParams : {
            pdbTable    : 'te_respuestas'
        }
    }
});
