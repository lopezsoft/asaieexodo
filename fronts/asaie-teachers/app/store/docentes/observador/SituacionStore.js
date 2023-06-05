Ext.define('Admin.store.docentes.observador.SituacionStore', {
    extend: 'Ext.data.Store',
    storeId : 'SituacionStore',
  	fields: [
		{ name: 'situacion' }						
   	],
    data 	: [
		{situacion : 'NO APLICA'},
    	{situacion : 'MALA'},
		{situacion : 'MALO'},
    	{situacion : 'PRECARIA'},
		{situacion : 'PRECARIO'},
    	{situacion : 'REGULAR'},
    	{situacion : 'BUENA'},
		{situacion : 'BUENO'},
		{situacion : 'SOBRE SALIENTE'},
    	{situacion : 'EXCELENTE'}
    ]
});