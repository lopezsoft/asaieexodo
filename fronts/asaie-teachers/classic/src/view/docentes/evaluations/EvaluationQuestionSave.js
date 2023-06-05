Ext.define('Admin.view.docentes.EvaluationQuestionSave',{
    extend          : 'Admin.base.SaveWindow',
    alias  	        : 'widget.evaluationquestionsave',
    xtype  	        : 'evaluationquestionsave',
    defaultFocus    : 'customtext',
    controller      : 'actividades',
    store           : 'EvaluationQuestionsStore',
    maxHeight       : 350,
    items 	: [
        {
            xtype       : 'customform',
            items   : [
                {
                    xtype       : 'customhtmleditor',
                    enableFont	: true,
                    name        : 'pregunta',
                    fieldLabel  : 'Título de la pregunta'
                }
            ]
        }
    ]
});
