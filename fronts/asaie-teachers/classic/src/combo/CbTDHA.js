Ext.define('Admin.combo.CbTDHA',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
		'Admin.store.docentes.observador.TDHAStore'
	],
	initComponent: function(){
		Admin.getApplication().onStore('docentes.observador.TDHAStore');
		this.callParent(arguments);
	},
	alias		: 'widget.CbTDHA',
	fieldLabel	: 'TRASTORNO DEL ESPECTRO AUTISTA (TEA):',
	name		: 'tdha',
    displayField: 'tdha',
    valueField	: 'tdha',
    itemId		: 'CbTDHA',
	value		: 'NO APLICA',
	store		: 'TDHAStore',
    queryMode	: 'local'
});
