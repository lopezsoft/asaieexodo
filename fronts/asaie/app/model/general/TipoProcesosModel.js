/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.TipoProcesosModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id',type : 'int'},
        { name: 'nombre_proceso',type : 'string'},
        { name: 'estado', type : 'bool'}
    ]
});
