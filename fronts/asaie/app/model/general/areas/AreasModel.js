/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.AreasModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'cod_area',type : 'int'},
        { name: 'area',type : 'string'},
        { name: 'abrev',type : 'string'},
        { name: 'ordenar',type : 'int'},
        { name: 'estado', type : 'int'}
    ]
});