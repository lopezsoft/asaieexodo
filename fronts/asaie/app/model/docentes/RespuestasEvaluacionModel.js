/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.model.docentes.RespuestasEvaluacionModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id_pregunta'},
        { name: 'respuesta'},
        { name: 'valor'},
        { name: 'verdadera', type : 'bool'},
        { name: 'estado', type : 'bool'}
    ]
});