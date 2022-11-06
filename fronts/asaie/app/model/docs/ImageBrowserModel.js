Ext.define('Admin.model.docs.ImageBrowserModel', {
    extend: 'Ext.data.Model',
    idProperty : 'pathFile',
    fields: [
    	{ name: 'name' },
        { name: 'format' },
        { name: 'pathFile'},
        { name: 'url'},
        { name: 'type'},
        { name: 'mime'},
        { name: 'size'},
        { name: 'lastModified'}
   	]
});
