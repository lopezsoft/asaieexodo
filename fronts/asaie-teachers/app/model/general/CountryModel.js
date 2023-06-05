/**
 * Created by LOPEZSOFT2 on 11/12/2016.
 */
Ext.define('Admin.model.general.CountryModel',{
    extend  : 'Admin.model.base.BaseModel',
    property    : 'id',
    fields      : [
        { name  : 'id'},
        { name  : 'country_code'},
        { name  : 'country_name'},
        { name  : 'abbreviation'},
        { name  : 'image'},
        { name  : 'currency'}
    ]
});
