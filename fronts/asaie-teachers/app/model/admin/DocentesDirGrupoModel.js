Ext.define('Admin.model.admin.DocentesDirGrupoModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id_docente',
    fields  : [
        {name : 'id_docente'},
        {name : 'id_inst'},
        {name : 'id_sede'},
        {name : 'sede'},
        {name : 'nombres'},
        {name : 'año'},
        {name : 'year'},
        {name : 'estado', type: 'bool'}
    ]
});
