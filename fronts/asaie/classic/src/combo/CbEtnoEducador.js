Ext.define('Admin.combo.CbEtnoEducador',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.EtnoEducadorStore'
    ],
	alias	    : 'widget.CbEtnoEducador',
	fieldLabel	: 'Etno educador',
	name		: 'id_etno_edu',
    displayField: 'tipo',
    valueField	: 'id',
	reference 	: 'CbEtnoEducador',
    publishes   : 'value',
    store		: 'EtnoEducadorStore'
});