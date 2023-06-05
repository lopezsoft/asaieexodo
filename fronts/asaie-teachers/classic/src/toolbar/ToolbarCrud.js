Ext.define('Admin.toolbar.ToolbarCrud',{
	extend	: 'Admin.toolbar.CustomToolbar',
	alias 	: 'widget.toolbarCrud',
	xtype 	: 'toolbarcrud',
	requires: [
        'Admin.button.ButtonsCrud',
        'Admin.button.CloseButton'
    ],
	xtype	: 'toolbarCrud',
	items 	: [
		{
			xtype	: 'facebookButton'
		},
		{
			xtype	: 'youtubeButton'
		},'-',
		{
			xtype	: 'printButton'
		},
		'->',
        {
        	xtype	: 'addButton'
        },'-',
        {
        	xtype	: 'editButton'
        },'-',
		{
			xtype	: 'deletebutton'
		},'-',
        {
			xtype 	: 'closebutton'
		}
	]
});
