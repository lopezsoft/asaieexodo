Ext.define('Admin.combo.CbCountries',{
	extend	: 'Admin.combo.CustomComboBox',
	alias	: 'widget.CbCountries',
	fieldLabel	: 'País o Nación de origen',
    emptyText 	: 'Elija un País',
    requires: [
        'Admin.store.general.CountryStore'
    ],
    name		: 'id_country',
    displayField: 'country_name',
    valueField	: 'id',
    store		: 'CountryStore',
    autoLoadOnValue : true
});
