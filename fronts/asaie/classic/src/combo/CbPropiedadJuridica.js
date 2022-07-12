Ext.define('Admin.combo.CbPropiedadJuridica',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.PropiedadJuridicaStore'
    ],
	alias	    : 'widget.CbPropiedadJuridica',
	fieldLabel	: 'Propiedad jurídica',
	name		: 'PROPIEDAD_PLANTA_FIS',
    displayField: 'PROP_SERV',
    valueField	: 'COD_PROP',
	reference 	: 'CbPropiedadJuridica',
    publishes   : 'value',
    store		: 'PropiedadJuridicaStore'
});