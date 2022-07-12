Ext.define('Admin.view.estudiantes.menu.AcademicActivities',{
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'estudiantes',
    alias       : 'widget.academicactivitiesstudents',
    layout      : 'responsivecolumn',
    defaultType : 'containerButton',
    items   : [
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Evaluaciones',
                    iconCls : 'x-fa fa-spinner',
                    handler : 'onStudentsEvaluations'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actividades en línea',
                    iconCls : 'x-fa fa-spinner',
                    handler : 'onStudentsActivities'
                }
            ]
		},
		{
            items   : [
                {
                    xtype   : 'buttonPanel',
					text    : 'Clases en vivo',
					handler : 'onLiveClasses',
                    iconCls : 'fas fa-video'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actividades en clase',
                    handler : '',
                    disabled: true,
                    iconCls : 'x-fa fa-spinner'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Solicitud de permisos',
                    handler : '',
                    disabled: true,
                    iconCls : 'x-fa fa-spinner'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Ausencias diarias',
                    handler : '',
                    disabled: true,
                    iconCls : 'x-fa fa-spinner'
                }
            ]
        }
    ]
});
