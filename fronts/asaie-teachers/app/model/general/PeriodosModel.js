Ext.define('Admin.model.general.PeriodosModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
    	{ name: 'periodo' },
		{ name: 'descripcion_periodo' },
		{ name: 'nombre_grado_agrupado' },
		{ name: 'id_grado_agrupado' },
		{ name: 'fecha_inical', 			type : 'date',  dateFormat: 'Y-m-d'},
		{ name: 'fecha_cierre', 			type : 'date',  dateFormat: 'Y-m-d' },
		{ name: 'fecha_inical_nivelacion', 	type : 'date',  dateFormat: 'Y-m-d' },
		{ name: 'fecha_cierre_nivelacion', 	type : 'date',  dateFormat: 'Y-m-d' },
		{ name: 'porciento' , 				type : 'float'},
		{ name: 'estado', 					type : 'bool' },
		{ name: 'bloquear', 				type : 'bool' },
		{ name: 'calificable', 				type : 'bool' }
   	 ]
});
