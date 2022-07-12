/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.AspectosObservadorModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'descripcion',type : 'string'},
        { name: 'convivencia', type : 'int'},
        { name: 'estado', type : 'int'}
    ]
});