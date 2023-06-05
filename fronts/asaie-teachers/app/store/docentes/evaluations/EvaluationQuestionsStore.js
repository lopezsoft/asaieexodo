Ext.define('Admin.store.docentes.EvaluationQuestionsStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'EvaluationQuestionsStore',
    requires : [
        'Admin.model.docentes.PreguntasEvaluacionModel'
    ],
    model   : 'Admin.model.docentes.PreguntasEvaluacionModel',
    proxy : {
        storeId : 'EvaluationQuestionsStore',
		typeData: 'Ajax',
        extraParams : {
            pdbTable    : 'te_preguntas'
        }
    }
});
