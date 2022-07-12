/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.model.simulacros.SesionesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id', type : 'int'},
        { name: 'id_curso'},
        { name: 'nombre'},
        { name: 'descripcion'},
        { name: 'num_preguntas',type : 'int'},
        { name: 'esquema', type : 'int'},
        { name: 'intentos'},
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
        { name: 'periodo'}
    ]
});