/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.admin.ADocentesModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id_docente',
    fields  : [
        {name : 'id_docente'},
        {name : 'id_country'},
        {name : 'n_cargo'},
        {name : 'cod_car'},
        {name : 'cod_ense'},
        {name : 'cod_vin'},
        {name : 'direccion'},
        {name : 'tipo_sangre'},
        {name : 'image'},
        {name : 'mime'},
        {name : 'documento'},
        {name : 'fecha_nacimiento'},
        {name : 'apellido1'},
        {name : 'apellido2'},
        {name : 'nombre1'},
        {name : 'nombre2'},
        {name : 'sexo'},
        {name : 'id_escalafon'},
        {name : 'arean_ens'},
        {name : 'edad'},
        {name : 'movil'},
        {name : 'fijo'},
        {name : 'mun_exp'},
        {name : 'mun_nac'},
        {name : 'email'},
        {name : 'password'},
        {name : 'estado', type: 'bool'}
    ]
});