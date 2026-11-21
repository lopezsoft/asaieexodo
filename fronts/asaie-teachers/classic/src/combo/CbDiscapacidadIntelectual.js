Ext.define('Admin.combo.CbDiscapacidadIntelectual',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
		'Admin.store.docentes.observador.DiscapacidadIntelectualStore'
	],
	initComponent: function(){
		Admin.getApplication().onStore('docentes.observador.DiscapacidadIntelectualStore');
		this.callParent(arguments);
	},
	alias		: 'widget.CbDiscapacidadIntelectual',
	fieldLabel	: 'DISCAPACIDAD INTELECTUAL:',
	name		: 'disc_intelectual',
    displayField: 'disc_intelectual',
    valueField	: 'disc_intelectual',
    itemId		: 'CbDiscapacidadIntelectual',
	value		: 'NO APLICA',
	store		: 'DiscapacidadIntelectualStore',
    queryMode	: 'local'
});
