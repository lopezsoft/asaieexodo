/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.AsignaturaCertificadoModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'subject_parent_id', type : 'int'},
        { name: 'subject_related_id', type : 'int'},
        { name: 'nombre'},
        { name: 'abrev'},
        { name: 'state', type : 'int'},
        { name: 'year', type : 'int'},
        { name: 'ih', type : 'float'}
    ]
});


