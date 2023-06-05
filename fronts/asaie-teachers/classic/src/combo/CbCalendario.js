Ext.define('Admin.combo.CbCalendario',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.CalendarioStore'
    ],
	alias	    : 'widget.CbCalendario',
	fieldLabel	: 'Calendario',
	name		: 'ID_CALENDARIO',
    displayField: 'CALENDARIO',
    valueField	: 'COD_CAL',
	reference 	: 'CbCalendario',
    publishes   : 'value',
    store		: 'CalendarioStore'
});