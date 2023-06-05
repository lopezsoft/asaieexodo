/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.simulacros.AreasSimModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id',type : 'int'},
        { name: 'nombre',type : 'string'},
        { name: 'abrev',type : 'string'},
        { name: 'estado', type : 'bool'}
    ]
});