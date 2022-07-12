Ext.define('Admin.combo.CbDiscalculia',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.docentes.observador.DiscalculiaStore'
    ],
	alias		: 'widget.CbDiscalculia',
	fieldLabel	: 'Discalculia:',
	name		: 'discalculia',
    displayField: 'discalculia',
    valueField	: 'discalculia',
    itemId		: 'CbDiscalculia',
    store		: 'DiscalculiaStore',
    queryMode	: 'local'
});