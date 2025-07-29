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
	fieldLabel	: 'TRASTORNO POR DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD (TDHA):',
	name		: 'tdha',
    displayField: 'tdha',
    valueField	: 'tdha',
    itemId		: 'CbTDHA',
	value		: 'NO APLICA',
	store		: 'TDHAStore',
    queryMode	: 'local'
});
