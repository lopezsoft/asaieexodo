/**
 * Created by LOPEZSOFT on 2/05/2016.
 */
Ext.define('Admin.model.estudiantes.perfil.PerfilEstudiantesModel',{
    extend      : 'Admin.model.base.BaseModel',
    idProperty  : 'id',
    fields  : [
        { name  : 'id'},
        { name  : 'id_estudiante'},
        { name  : 'nombre_usuario'},
        { name  : 'password_u'},
        { name  : 'foto_perfil'},
        { name  : 'mime'},
        { name  : 'fecha'},
        { name  : 'estado', type : 'int'},
        { name  : 'timestamp'}
    ]
});