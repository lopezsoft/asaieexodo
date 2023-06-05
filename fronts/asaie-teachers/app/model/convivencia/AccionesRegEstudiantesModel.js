/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.model.convivencia.AccionesRegEstudiantesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id'},
        { name : 'id_res_sit_est'},
        { name : 'id_accion'},
        { name : 'personas_involucradas'},
        { name : 'testigos'},
        { name : 'personas_afectadas'},
        { name : 'compromiso'},
        { name : 'tratamiento_peg'},
        { name : 'firma_ivolucrados'},
        { name : 'obs_accion'},
        { name : 'fecha_registro'},
        { name : 'estado'},
        { name : 'año'}
    ]
});