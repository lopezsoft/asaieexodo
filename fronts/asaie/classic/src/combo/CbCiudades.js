Ext.define('Admin.combo.CbCiudades',{
	extend	: 'Admin.combo.CustomComboBox',
	alias	: 'widget.CbCiudades',
	fieldLabel	: 'Ciudad o municipio:',
    emptyText 	: 'Elija una ciudad o municipio',
    requires: [
        'Admin.store.general.CitiesStore'
    ],
    name		: 'id_city',
    displayField: 'name_city',
    valueField	: 'id',
    store		: 'CitiesStore',
    autoLoadOnValue : true,
	value	: 149,
});
