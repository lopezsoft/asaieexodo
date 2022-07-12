Ext.define('Admin.view.estudiantes.home.StudentsDashboard', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'Admin.view.widgets.WidgetA'
    ],
    controller  : 'estudiantes',
    alias       : 'widget.studentsdashboard',
    layout      : 'responsivecolumn',
    items   : [
        {
            xtype           : 'widget-a',
            userCls         : 'small-100 big-100'
        },
        {
            xtype           : 'teacherscourses',
            userCls         : 'small-100 big-100'
        }
    ]
});