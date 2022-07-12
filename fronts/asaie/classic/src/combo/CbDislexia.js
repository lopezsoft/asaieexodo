Ext.define('Admin.combo.CbDislexia',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.docentes.observador.DislexiaStore'
    ],
	alias		: 'widget.CbDislexia',
	fieldLabel	: 'Dislexia:',
	name		: 'dislexia',
    displayField: 'dislexia',
    valueField	: 'dislexia',
    itemId		: 'CbDislexia',
    store		: 'DislexiaStore',
    queryMode	: 'local'
});