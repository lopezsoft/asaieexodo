Ext.define('Admin.store.docentes.observador.DislexiaStore', {
    extend	: 'Ext.data.Store',
    storeId : 'DislexiaStore',
  	fields	: [
		{ name: 'dislexia'}
   	],
    data 	: [
		{dislexia : 'NO APLICA'},
    	{dislexia : 'FONOLÓGICA'},
		{dislexia : 'SUPERFICIAL'}
    ]
});