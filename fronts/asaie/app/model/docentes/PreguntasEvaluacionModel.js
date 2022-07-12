/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.model.docentes.PreguntasEvaluacionModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id_evaluacion'},
        { name: 'pregunta'},
        { name: 'descripcion'},
        { name: 'valor'},
        { name: 'tipo'},
        { name: 'num_respuestas'},
        { name: 'estado', type : 'bool'}
    ]
});