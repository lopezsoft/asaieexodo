Ext.define('Admin.combo.CbDepartamentos',{
	extend		: 'Admin.combo.CustomComboBox',
	alias		: 'widget.CbDepartamentos',
	fieldLabel	: 'Departamento:',
	allowBlank	: false,
    emptyText 	: 'Elija un departamento',
	requires: [
		'Admin.store.general.DptosStore'
	],
    name		: 'dpto',
    displayField: 'nombre',
    valueField	: 'id',
    store		: 'DptosStore',
    reference   : 'dpto',
    publishes   : 'value',
    listeners	: {    	
		select 	: function(combo, record, eOpts){
			var cSME	= Admin.getApplication();
			extParam	= {
				pDpto : record.get('id')
			};
			cSME.setParamStore('CitiesStore', extParam, true);
		},
		afterrender : function ( cbo, eOpts ){
		 	if(!Ext.isEmpty(cbo.getValue())){
			 	var cSME	= Admin.getApplication();
				extParam	= {
					pDpto : cbo.getValue()
				};
				cSME.setParamStore('CitiesStore', extParam, true);
			 }	
		}
	}
});
