Ext.define('Admin.store.docentes.observador.DisortografiaStore', {
    extend: 'Ext.data.Store',
    storeId : 'DisortografiaStore',
  	fields: [
		{ name: 'disortografia'}
   	],
    data 	: [
		{disortografia : 'NO APLICA'},
    	{disortografia : 'TEMPORAL'},
		{disortografia : 'PERCEPTIVO - CINÉSTSICA'},
		{disortografia : 'DISORTOCINÉTICA'},
		{disortografia : 'VISOESPACIAL'},
		{disortografia : 'DINÁMICA'},
		{disortografia : 'SEMÁNTICA'},
		{disortografia : 'CULTURAL'}
    ]
});