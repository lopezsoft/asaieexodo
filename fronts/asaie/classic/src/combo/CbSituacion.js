Ext.define('Admin.combo.CbSituacion',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.docentes.observador.SituacionStore'
    ],
	alias		: 'widget.CbSituacion',
	fieldLabel	: 'Situación:',
	name		: 'situacion',
    displayField: 'situacion',
    valueField	: 'situacion',
    itemId		: 'cbSituacion',
    store		: 'SituacionStore',
    queryMode	: 'local'
});