/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.AsignaturaModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id_pk',
    fields: [
        { name: 'id'},
        { name: 'id_area'},
        { name: 'asignatura'},
        { name: 'area'},
        { name: 'abrev'},
        { name: 'ordenar'},
        { name: 'excluir',type : 'int'},
        { name: 'electiva',type : 'int'},
        { name: 'estado', type : 'int'}
    ]
});
