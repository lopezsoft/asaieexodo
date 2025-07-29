Ext.define('Admin.store.docentes.observador.AnnotationTypesStore', {
    extend: 'Ext.data.Store',
    storeId : 'AnnotationTypesStore',
	fields: [
		{
			name: 'annotation_type',
			type: 'int',
		}
	],
	data 	: [
		{
			annotation_type : 1,
			annotation_type_name: 'Académico'
		},
		{
			annotation_type : 2,
			annotation_type_name: 'Disciplinario'
		}
	]
});
