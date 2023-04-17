/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.AsignaturaCertificadoModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id_asig_padre'},
        { name: 'nombre'},
        { name: 'abrev'},
        { name: 'estado', type : 'int'},
        { name: 'ih', type : 'float'}
    ]
});


