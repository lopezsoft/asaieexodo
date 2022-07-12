Ext.define('Admin.combo.CbSedes',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.SedesStore'
    ],
	alias	: 'widget.CbSedes',
	fieldLabel	: 'Sede:',
	name		: 'id_sede',
    displayField: 'NOMBRE_SEDE',
    valueField	: 'ID',
    itemId		: 'comboSedes',
	reference 	: 'comboSedes',
    publishes   : 'value',
    store		: 'SedesStore'
});