/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.ConfiguracionBoletinModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty : 'id',
    fields: [
        { name: 'promedio',type : 'int'},
        { name: 'msglogro'},
        { name: 'firmarector',type : 'int'},
        { name: 'firmasecre',type : 'int'},
        { name: 'firmacoor',type : 'int'},
        { name: 'firmadirgrupo',type : 'int'},
        { name: 'activamsg',type : 'int'},
        { name: 'activeindica',type : 'int'},
        { name: 'bol_desem',type : 'int'},
        { name: 'permi_ind',type : 'int'}
    ]
});
