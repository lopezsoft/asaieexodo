Ext.define('Admin.combo.CbAnnotationTypes',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.docentes.observador.AnnotationTypesStore'
    ],
	initComponent: function(){
		Admin.getApplication().onStore('docentes.observador.AnnotationTypesStore');
		this.callParent(arguments);
	},
	alias	: 'widget.CbAnnotationTypes',
	fieldLabel	: 'Tipo de seguimiento:',
	labelAlign	: 'top',
	name		: 'annotation_type',
    displayField: 'annotation_type_name',
    valueField	: 'annotation_type',
	value		: 1,
    itemId		: 'annotation_type',
    store		: 'AnnotationTypesStore',
    reference   : 'annotationTypeCombo',
    publishes   : 'value'
});
