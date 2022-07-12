/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.admin.DirGrupoModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id',
    fields  : [
        {name : 'id'},
        {name : 'id_sede'},
        {name : 'id_docente'},
        {name : 'id_grado'},
        {name : 'grupo'},
        {name : 'id_jorn'},
        {name : 'year'},
        {name : 'estado', type : 'bool'},
        {name : 'sede'},
        {name : 'docente'},
        {name : 'jornada'},
        {name : 'grado'}
    ]
});