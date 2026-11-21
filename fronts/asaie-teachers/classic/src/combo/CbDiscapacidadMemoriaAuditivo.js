Ext.define('Admin.combo.CbDiscapacidadMemoriaAuditivo',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
		'Admin.store.docentes.observador.DiscapacidadMemoriaAuditivoStore'
	],
	initComponent: function(){
		Admin.getApplication().onStore('docentes.observador.DiscapacidadMemoriaAuditivoStore');
		this.callParent(arguments);
	},
	alias		: 'widget.CbDiscapacidadMemoriaAuditivo',
	fieldLabel	: 'DISCAPACIDAD DE LA MEMORIA Y EL PROCESAMIENTO AUDITIVO:',
	name		: 'disc_memoria_auditivo',
    displayField: 'disc_memoria_auditivo',
    valueField	: 'disc_memoria_auditivo',
    itemId		: 'CbDiscapacidadMemoriaAuditivo',
	value		: 'NO APLICA',
	store		: 'DiscapacidadMemoriaAuditivoStore',
    queryMode	: 'local'
});
