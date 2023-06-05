/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.model.convivencia.SituacionesRegEstudiantesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id'  },
        { name : 'id_matric'},
        { name : 'grado'},
        { name : 'grupo'},
        { name : 'id_docente'},
        { name : 'id_admin'},
        { name : 'docente'},
        { name : 'directivo'},
        { name : 'numero'},
        { name : 'descripcion'},
        { name : 'observacion'},
        { name : 'id_tipo'},
        { name : 'tipo'},
        { name : 'año'}
    ]
});