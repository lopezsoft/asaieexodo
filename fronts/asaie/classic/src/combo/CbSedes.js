Ext.define('Admin.combo.CbSedes',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.SedesStore'
    ],
	alias	: 'widget.CbSedes',
	fieldLabel	: 'Sede:',
	name		: 'id_sede',
    displayField: 'headquarters_name',
    valueField	: 'id',
    itemId		: 'comboSedes',
	reference 	: 'comboSedes',
    publishes   : 'value',
    store		: 'SedesStore'
});
