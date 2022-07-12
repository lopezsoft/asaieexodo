Ext.define('Admin.combo.CbADesicion',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.general.ADesicionStore'
    ],
	alias		: 'widget.CbADesicion',
	fieldLabel	: 'Desición:',
	name		: 'desicion',
    displayField: 'desicion',
    valueField	: 'desicion',
    store		: 'ADesicionStore'
});