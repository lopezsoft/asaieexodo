Ext.define('Admin.model.docs.ImageBrowserModel', {
    extend: 'Ext.data.Model',
    idProperty : 'id',
    fields: [
    	{ name: 'file_description' },
        { name: 'extension_file' },
        { name: 'file_path'},
        { name: 'uuid'},
        { name: 'type'},
        { name: 'mime'},
        { name: 'size'},
        { name: 'lastModified'}
   	]
});
