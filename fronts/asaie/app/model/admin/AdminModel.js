/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.admin.AdminModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id',
    fields  : [
        {name : 'id'},
        {name : 'id_inst'},
		{name : 'id_vinculacion'},
		{name : 'id_cra_adva'},
		{name : 'id_tiempo_asignado'},
		{name : 'id_ubicacion'},
		{name : 'id_fuente_recursos'},
		{name : 'id_nivel_jerarquico'},
		{name : 'id_doc'},
        {name : 'numero_documento'},
        {name : 'apellido1'},
        {name : 'apellido2'},
        {name : 'nombre1'},
        {name : 'nombre2'},
        {name : 'tipo_sangre'},
        {name : 'sexo'},
        {name : 'fecha_nacimiento'},
        {name : 'edad'},
        {name : 'telefono'},
        {name : 'direccion'},
        {name : 'celular'},
        {name : 'dep_lug_nac'},
        {name : 'mun_lug_nac'},
        {name : 'dep_lug_exp'},
        {name : 'mun_lug_exp'},
        {name : 'fecha_vinculacion'},
        {name : 'foto'},
        {name : 'asign_bas_mensual'},
        {name : 'email'},
        {name : 'mime'},
        {name : 'estado', type : 'bool'}
    ]
});
