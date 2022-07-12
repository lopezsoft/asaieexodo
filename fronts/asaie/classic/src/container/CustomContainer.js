Ext.define('Admin.container.CustomContainer',{
    extend  : 'Ext.container.Container',
    alias   : 'widget.customcontainer',
    layout: {
        type: 'hbox'
    },
    defaults	: {
        xtype       : 'customtext',
        flex        : 1,
        style: {
            padding: '2px'
        }
    }
});