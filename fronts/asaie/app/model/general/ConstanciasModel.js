/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.ConstanciasModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'header1'},
        { name: 'header2'},
        { name: 'body'},
        { name: 'expedition'},
        { name: 'message'},
        { name: 'resolution'},
        { name: 'rector_firm', type : 'int'},
        { name: 'signature_secretary', type : 'int'},
        { name: 'resolution'},
        { name: 'year_from',   type : 'int'},
        { name: 'year_until',   type : 'int'},
        { name: 'show_number',   type : 'int'},
        { name: 'type',   type : 'int'}
    ]
});