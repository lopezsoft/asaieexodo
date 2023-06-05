Ext.define('Admin.model.docentes.MaterialEducativoModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id'},
        { name: 'id_curso'},
        { name: 'id_material'},
        { name: 'nombre'},
        { name: 'descripcion'},
        { name: 'asignatura'},
        { name: 'url_video'},
        { name: 'url_archivo'},
        { name: 'mime'},
        { name: 'url_enlace'},
        { name: 'fecha'},
        { name: 'hora'},
        { name: 'fecha_cierre'},
        { name: 'hora_ciere'},
        { name: 'estado', type : 'int'},
        { name: 'restringir', type : 'int'},
        { name: 'calificable', type : 'int'}
    ]
});