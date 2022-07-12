Ext.define('Admin.store.docentes.observador.DesicionStore', {
    extend: 'Ext.data.Store',
    storeId : 'DesicionStore',
  	fields: [
		{ name: 'desicion' }						
   	],
    data 	: [
    	{desicion : 'SI'},
    	{desicion : 'NO'}
    ]
});