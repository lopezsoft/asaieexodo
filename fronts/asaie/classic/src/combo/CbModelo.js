Ext.define('Admin.combo.CbModelo',{
	extend	: 'Admin.combo.CustomComboBox',
	requires: [
		 'Admin.store.general.MetodologiasStore'
    ],
	alias	: 'widget.CbModelo',
	fieldLabel	: 'Modelo:',
	name		: 'id_metod',
    displayField: 'metodologia',
    valueField	: 'id',
    itemId		: 'combomodelo',
	reference 	: 'comboModelo',
    store		: 'MetodologiasStore'
});
