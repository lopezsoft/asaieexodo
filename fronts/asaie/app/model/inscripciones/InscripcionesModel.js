/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.inscripciones.InscripcionesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        {name : 'id'},
        {name : 'id_zona'},
        {name : 'id_year'},
        { name: 'id_country'},
        { name: 'id_sexo'},
        { name: 'id_documento'},
        {name : 'foto'},
        {name : 'mime'},
        {name: 'nro_documento'},
        {name : 'lug_nacimiento'},
        {name : 'lug_residencia'},
        {name : 'lug_expedicion'},
        {name : 'apellido1'},
        {name : 'apellido2'},
        {name : 'nombre1'},
        {name : 'nombre2'},
        {name : 'tipo_sangre'},
        { name: 'fecha_ingreso'},
        {name : 'fecha_nacimiento'},
        {name : 'edad'},
        {name : 'estrato'},
        {name : 'direccion'},
        {name : 'localidad'},
        {name : 'telefono'},
        {name : 'movil'},
        {name : 'ips'},
        {name : 'email'}
    ]
});