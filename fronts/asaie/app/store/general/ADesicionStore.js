Ext.define('Admin.store.general.ADesicionStore', {
    extend: 'Ext.data.Store',
    storeId : 'ADesicionStore',
  	fields: [
		{ name: 'desicion' }						
   	],
    data 	: [
    	{desicion : 'Si'},
    	{desicion : 'No'}
    ]
});