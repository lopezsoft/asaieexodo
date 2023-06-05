Ext.define('Admin.tab.Panel',{
    extend   : 'Admin.tab.CustomTab',
    alias   : 'widget.TabPanel',
    width   : '100%',
    height  : '100%',
    frame   : true,
    activeTab: 0,
    defaults: {
        bodyPadding: 1,
        scrollable: true
    }
});