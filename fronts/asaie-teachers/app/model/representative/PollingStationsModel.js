Ext.define('Admin.model.representative.PollingStationsModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name  : 'table_name'},
        { name  : 'table_number'},
        { name  : 'table_location'},
        { name  : 'start_time'},
        { name  : 'closing_time'},
        { name  : 'state'},
        { name  : 'year'}
    ]
});
