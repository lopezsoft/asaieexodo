Ext.define('Admin.combo.CbTipoProcesos',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
        'Admin.store.general.TipoProcesosStore'
    ],
	alias		: 'widget.cbtipoprocesos',
	fieldLabel	: 'Tipo',
	name		: 'tipo',
    displayField: 'nombre_proceso',
    valueField	: 'id',
    xtype		: 'cbtipoprocesos',
	reference 	: 'cbtipoprocesos',
    store		: 'TipoProcesosStore',
	labelAlign	: 'top',
	labelWidth	: 80,
	width 		: 160,
	pageSize    : 0
});
