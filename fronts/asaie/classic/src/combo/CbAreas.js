Ext.define('Admin.combo.CbAreas',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
        'Admin.store.general.AreasStore'
    ],
	alias	: 'widget.CbAreas',
	fieldLabel	: 'Área',
	name		: 'id_area',
    displayField: 'area',
    valueField	: 'id',
    itemId		: 'comboArea',
	reference 	: 'comboArea',
    store		: 'AreasStore'
});
