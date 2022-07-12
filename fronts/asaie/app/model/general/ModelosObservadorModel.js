/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.ModelosObservadorModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'descripcion',type : 'string'},
        { name: 'estado', type : 'int'}
    ]
});