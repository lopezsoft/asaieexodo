/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.ProyCuposModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id_sede',type : 'int'},
        { name: 'cod_grado',type : 'string'},
        { name: 'año',type : 'int'},
        { name: 'total',type : 'int'},
        { name: 'tipo', type : 'int'}
    ]
});