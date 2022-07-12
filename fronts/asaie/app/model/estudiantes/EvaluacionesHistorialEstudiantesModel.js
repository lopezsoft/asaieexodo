/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.model.estudiantes.EvaluacionesHistorialEstudiantesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id'},
        { name: 'id_evaluacion_compartida'},
        { name: 'res_verdaderas',type : 'int'},
        { name: 'res_falsas', type : 'int'},
        { name: 'res_sin_responder',  type : 'int'},
        { name: 'res_abiertas', type : 'int'},
        { name: 'hora_inicio'},
        { name: 'hora_final'},
        { name: 'tiempo'},
        { name: 'segundos'},
        { name: 'punataje', type : 'float'},
        { name: 'intento', type : 'int'}
    ]
});