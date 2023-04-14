/**
 * Created by LOPEZSOFT on 2/05/2016.
 */
Ext.define('Admin.model.docentes.perfil.PerfilDocentesModel',{
    extend      : 'Admin.model.base.BaseModel',
    idProperty  : 'id_docente',
    fields  : [
        { name  : 'id'},
        { name  : 'id_sede'},
        { name  : 'id_doc'},
        { name  : 'n_cargo'},
        { name  : 'cod_car'},
        { name  : 'cod_ense'},
        { name  : 'cod_vin'},
        { name  : 'direccion'},
        { name  : 'tipo_sangre'},
        { name  : 'foto'},
        { name  : 'mime'},
        { name  : 'documento'},
        { name  : 'fec_nac'},
        { name  : 'apellido1'},
        { name  : 'apellido2'},
        { name  : 'nombre1'},
        { name  : 'nombre2'},
        { name  : 'sexo'},
        { name  : 'movil'},
        { name  : 'fijo'},
        { name  : 'e_mail'},
        { name  : 'año'}
    ]
});
