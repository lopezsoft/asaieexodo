Ext.define('Admin.combo.CbDisortografia',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.docentes.observador.DisortografiaStore'
    ],
	alias		: 'widget.CbDisortografia',
	fieldLabel	: 'Disortografia:',
	name		: 'disortografia',
    displayField: 'disortografia',
    valueField	: 'disortografia',
    itemId		: 'CbDisortografia',
    store		: 'DisortografiaStore',
	value		: 'NO APLICA',
    queryMode	: 'local'
});
