/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.EncabezadoObservadorModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'encabezado',type : 'string'},
        { name: 'cuerpo', type : 'string'},
        { name: 'firma', type : 'string'}
    ]
});