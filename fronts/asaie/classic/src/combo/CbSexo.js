Ext.define('Admin.combo.CbSexo',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.general.SexoStore'
    ],
	alias		: 'widget.CbSexo',
	fieldLabel	: 'Sexo',
	name		: 'sexo',
    displayField: 'sexo',
    valueField	: 'sexo',
    itemId		: 'CbSexo',
    store		: 'SexoStore',
    queryMode	: 'local'
});