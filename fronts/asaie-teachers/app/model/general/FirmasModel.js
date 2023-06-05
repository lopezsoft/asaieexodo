/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.FirmasModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty : 'id',
    fields: [
        { name: 'firma1'},
        { name: 'firma2'},
        { name: 'firma3'},
        { name: 'firma4'},
        { name: 'firmarector',type : 'int'},
        { name: 'firmasecre',type : 'int'},
        { name: 'firmacoor',type : 'int'},
        { name: 'firmadirgrupo',type : 'int'}
    ]
});
