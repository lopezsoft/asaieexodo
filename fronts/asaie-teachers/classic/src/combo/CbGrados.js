Ext.define('Admin.combo.CbGrados',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.GradosStore'
    ],
	alias	: 'widget.CbGrados',
	fieldLabel	: 'Grado:',
	name		: 'id_grado',
    displayField: 'grado',
    valueField	: 'id',
    itemId		: 'comboGrados',
	reference 	: 'comboGrados',
	publishes   : 'value',
	store		: 'GradosStore',
	listeners	: {
		select : function (cb,record) {
			extra = {
				pdbTable: 'periodos_academicos',
				pdbGrado: record.get('id'),
				pdbType	: 0
			};
			Admin.getApplication().setParamStore('PeriodosStore', extra);
		}
	}
});
