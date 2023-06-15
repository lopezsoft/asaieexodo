Ext.define('Admin.view.docentes.home.TeachersDashboard', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    alias		: 'widget.teacherdashboard',
    xtype       : 'teacherdashboard',
    layout		: 'responsivecolumn',
    items   : [
        {
            xtype   : 'periodosdocentes',
            userCls : 'small-100 big-50'
        },
        {
            xtype   : 'asignaciondocentes',
            userCls : 'small-100 big-50'
        }
    ]
});
