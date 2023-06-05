Ext.define('Admin.model.estudiantes.MaterialEducativoEstudiantesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id'},
        { name: 'id_matric'},
        { name: 'id_material'},
        { name: 'docente'},
        { name: 'grado'},
        { name: 'grupo'},
        { name: 'jornada'},
        { name: 'nombre'},
        { name: 'descripcion'},
        { name: 'nombre'},
        { name: 'comment_activity'},
        { name: 'comment_title'},
        { name: 'type_comment'},
        { name: 'docente'},
        { name: 'estudiante'},
        { name: 'asignatura'},
        { name: 'url_video'},
        { name: 'url_archivo'},
        { name: 'mime'},
        { name: 'fecha'},
        { name: 'url_enlace'},
        { name: 'leido', type : 'bool'}
    ]
});