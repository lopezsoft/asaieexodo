/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.CarnetsModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'url'},
        { name: 'name'},
        { name: 'student'},
        { name: 'school'},
		{ name: 'info'},
		{ name: 'qr', type	: 'bool'},
		{ name: 'active', type	: 'bool'}
    ]
});
