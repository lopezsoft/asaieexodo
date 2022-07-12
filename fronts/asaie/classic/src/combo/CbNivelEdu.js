Ext.define('Admin.combo.CbNivelEdu',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.NivelEduStore'
    ],
	alias	    : 'widget.CbNivelEdu',
	fieldLabel	: 'Último nivel educativo aprobado',
	name		: 'cod_nivel',
    displayField: 'tipo',
    valueField	: 'id',
	reference 	: 'CbNivelEdu',
    publishes   : 'value',
    store		: 'NivelEduStore'
});