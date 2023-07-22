Ext.define('Admin.combo.CbCargaDocente',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.docentes.CargaAgrupadaObservadorStore'
    ],
	labelAlign	: 'top',
	alias	    : 'widget.cbCargaDocente',
	itemId	    : 'cbCargaDocente',
	fieldLabel	: 'Carga docente',
    displayField: 'nombre_sexo',
    valueField	: 'grado',
	reference 	: 'cbCargaDocente',
	publishes	: 'value',
	minChars	: 2,
	flex		: 1,
	emptyText: 'Seleccione por favor...',
	tpl: Ext.create('Ext.XTemplate',
		'<ul class="x-list-plain"><tpl for=".">',
		'<li role="option" class="x-boundlist-item">{grado} - {grupo} - {jornada} - {sede}</li>',
		'</tpl></ul>'
	),
	// template for the content inside text field
	displayTpl: Ext.create('Ext.XTemplate',
		'<tpl for=".">',
		'{grado} - {grupo} - {jornada} - {sede}',
		'</tpl>'
	),
    store		: 'CargaAgrupadaObservadorStore'
});
