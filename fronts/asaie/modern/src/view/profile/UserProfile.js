Ext.define('Admin.view.profile.UserProfile', {
    extend: 'Ext.form.Panel',
    xtype: 'profile',
    cls: 'userProfile-container dashboard',

    scrollable: 'y',
    
    items: [
        {
            xtype: 'profileshare',

            userCls: 'big-100 small-100 dashboard-item shadow'
        },
        {
            xtype: 'profilesocial',

            userCls: 'big-50 small-100 dashboard-item shadow'
        },
        {
            xtype: 'profiledescription',

            userCls: 'big-50 small-100 dashboard-item shadow'
        },
        {
            xtype: 'profilenotifications',

            userCls: 'big-50 small-100 dashboard-item shadow'
        },
        {
            xtype: 'profiletimeline',

            userCls: 'big-50 small-100 dashboard-item shadow'
        } 
    ]
});
