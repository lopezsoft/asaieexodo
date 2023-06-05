Ext.define('Admin.combo.CbPeriodos',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.PeriodosStore'
    ],
	alias	: 'widget.CbPeriodos',
	fieldLabel	: 'Periodo:',
	name		: 'periodo',
    displayField: 'periodo',
    valueField	: 'periodo',
    itemId		: 'periodo',
    store		: 'PeriodosStore',
    width		: 120,
    labelWidth	: 50,
    reference   : 'periodo',
    publishes   : 'value',
    bind: {
        visible: '{comboGrupo.value}'
    },
	pageSize    : 0
});
