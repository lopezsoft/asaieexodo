/**
 * Created by LOPEZSOFT2 on 11/12/2016.
 */
Ext.define('Admin.model.general.CitiesModel',{
    extend  : 'Admin.model.base.BaseModel',
    property    : 'id',
    fields      : [
        { name  : 'id'},
        { name  : 'department_id'},
        { name  : 'city_code'},
        { name  : 'name_city'}
    ]
});
