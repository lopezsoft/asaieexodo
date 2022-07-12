Ext.define('Admin.view.general.perfil.UserProfil', {
    extend: 'Ext.container.Container',
    viewModel: {
        type: 'userprofile'
    },
    alias   : 'widget.profile',
    xtype   : 'profile',    
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    layout: 'responsivecolumn',
    items: [
        {
            xtype   : 'WidgetUserProfile',
            userCls : 'big-50 small-100 shadow'
        },
        {
            xtype   : 'userprofilform',
            userCls : 'big-50 small-100 shadow'
        }
    ]
});
