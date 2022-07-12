Ext.define('Admin.model.docs.ImageBrowserModel', {
    extend: 'Ext.data.Model',
    idProperty : 'path_delete',
    fields: [
    	{ name: 'name' },
        { name: 'format' },
        { name: 'path_download'},
        { name: 'path_delete'},
        { name: 'fecha'}
   	]
});