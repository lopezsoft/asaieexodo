Ext.define('Admin.combo.CbDisgrafia',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
		'Admin.store.docentes.observador.DisgrafiaStore'
	],
	initComponent: function(){
		Admin.getApplication().onStore('docentes.observador.DisgrafiaStore');
		this.callParent(arguments);
	},
	alias		: 'widget.CbDisgrafia',
	fieldLabel	: 'Disgrafía:',
	name		: 'disgrafia',
    displayField: 'disgrafia',
    valueField	: 'disgrafia',
    itemId		: 'CbDisgrafia',
	value		: 'NO APLICA',
	store		: 'DisgrafiaStore',
    queryMode	: 'local'
});
