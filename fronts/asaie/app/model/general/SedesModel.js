Ext.define('Admin.model.general.SedesModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id',
    fields: [
        { name: 'id'},
		{ name: 'city_id'},
        { name: 'zone_id'},
		{ name: 'sex_id	'},
        { name: 'headquarters_name'},
        { name: 'address'},
        { name: 'phones'},
        { name: 'suburd'},
        { name: 'email'},
        { name: 'is_main'},
        { name: 'state'},
    ]
});
