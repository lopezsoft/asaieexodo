Ext.define('Admin.model.admin.SchoolModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        {name : 'id'},
        {name : 'country_id'},
		{name : 'city_id'},
		{name : 'school_id'},
		{name : 'school_name'},
        {name : 'dni'},
        {name : 'director_name'},
        {name : 'suburb'},
        {name : 'address'},
        {name : 'location'},
        {name : 'phones'},
        {name : 'web'},
        {name : 'email'},
        {name : 'number_locations'},
    ]
});
