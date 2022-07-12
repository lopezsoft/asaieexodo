/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.model.convivencia.ControlSeguimientoEstudiantesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id'},
        { name : 'id_reg_sit_est', type : 'int'},
        { name : 'compromiso_estudiante', type : 'string'},
        { name : 'compromiso_acudiente', type : 'string'},
        { name : 'compromiso_docente', type : 'string'},
        { name : 'fecha'},
        { name : 'hora', type : 'string'},
        { name : 'fecha_acta'},
        { name : 'hora_acta', type : 'string'},
        { name : 'estado', type : 'bool'}
    ]
});