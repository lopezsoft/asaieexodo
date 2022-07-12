
Ext.define('Admin.model.estudiantes.StudentsEvaluationsModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id'},
        { name: 'enrollment_id'},
        { name: 'evaluation_id'},
        { name: 'docente'},
        { name: 'grado'},
        { name: 'grupo'},
        { name: 'jornada'},
        { name: 'nombre'},
        { name: 'descripcion'},
        { name: 'num_preguntas',type : 'int'},
        { name: 'esquema', type : 'int'},
        { name: 'intentos',  type : 'int'},
        { name: 'tiempo', type : 'int'},
        { name: 'paginas'},
        { name: 'hora_apertura'},
        { name: 'hora_cierre'},
        { name: 'fecha_cierre'},
        { name: 'fecha'}, { name: 'column_nota'},
        { name: 'publicada', type : 'bool'},
        { name: 'estado', type : 'bool'},
        { name: 'auto_calificar', type : 'int'},
        { name: 'column_nota'},
        { name: 'id_column_nota', type : 'int'},
        { name: 'periodo'},
        { name: 'eread', type : 'bool'}
    ]
});