Ext.define('Admin.combo.CbEstrato',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.general.EstratoStore'
    ],
	alias		: 'widget.CbEstrato',
	fieldLabel	: 'Estrato',
	name		: 'estrato',
    displayField: 'estrato',
    valueField	: 'estrato',
    itemId		: 'CbEstrato',
    store		: 'EstratoStore',
    queryMode	: 'local'
});