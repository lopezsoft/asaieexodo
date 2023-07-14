Ext.define('Admin.model.docs.ImageBrowserModel', {
    extend: 'Ext.data.Model',
    idProperty : 'id',
    fields: [
    	{ name: 'file_description' },
        { name: 'extension_file' },
        { name: 'file_path'},
        { name: 'url'},
        { name: 'uuid'},
        { name: 'type'},
        { name: 'mime_type'},
        { name: 'size_file'},
        { name: 'last_modified'}
   	]
});