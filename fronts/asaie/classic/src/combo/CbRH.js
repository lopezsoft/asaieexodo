Ext.define('Admin.combo.CbRH',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.general.RHStore'
    ],
	alias		: 'widget.CbRH',
	fieldLabel	: 'Grupo sanguíneo',
	name		: 'tipo_sangre',
    displayField: 'tipo_sangre',
    valueField	: 'tipo_sangre',
    itemId		: 'CbRH',
    store		: 'RHStore',
    queryMode	: 'local'
});