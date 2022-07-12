Ext.define('Admin.combo.CbEscalafon',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.EscalafonStore'
    ],
	alias	    : 'widget.CbEscalafon',
	fieldLabel	: 'Escalafón',
	name		: 'id_escalafon',
    displayField: 'tipo',
    valueField	: 'id',
	reference 	: 'CbEscalafon',
    publishes   : 'value',
    store		: 'EscalafonStore'
});