Ext.define('Admin.combo.CbTEA',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
		'Admin.store.docentes.observador.TEAStore'
	],
	initComponent: function(){
		Admin.getApplication().onStore('docentes.observador.TEAStore');
		this.callParent(arguments);
	},
	alias		: 'widget.CbTEA',
	fieldLabel	: 'TRASTORNO DEL ESPECTRO AUTISTA (TEA):',
	name		: 'tea',
    displayField: 'tea',
    valueField	: 'tea',
    itemId		: 'CbTEA',
	value		: 'NO APLICA',
	store		: 'TEAStore',
    queryMode	: 'local'
});
