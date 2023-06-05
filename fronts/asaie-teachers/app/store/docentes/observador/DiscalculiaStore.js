Ext.define('Admin.store.docentes.observador.DiscalculiaStore', {
    extend: 'Ext.data.Store',
    storeId : 'DiscalculiaStore',
  	fields: [
		{ name: 'discalculia'}
   	],
    data 	: [
		{discalculia : 'NO APLICA'},
    	{discalculia : 'VERVAL'},
		{discalculia : 'PRACTOGNÓSTICA'},
		{discalculia : 'LÉXICA'},
		{discalculia : 'GRÁFICA'},
		{discalculia : 'IDEOGNÓSTICA'},
		{discalculia : 'OPERACIONAL'}
    ]
});