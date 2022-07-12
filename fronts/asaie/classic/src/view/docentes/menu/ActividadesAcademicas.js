Ext.define('Admin.view.docentes.menu.ActividadesAcademicas',{
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'actividades',
    alias       : 'widget.actividadesacademicas',
    xtype       : 'actividadesacademicas',
    layout      : 'responsivecolumn',
    defaultType : 'containerButton',
    items   : [
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actividades en línea',
                    handler : 'onActividadesView',
                    iconCls : 'fas fa-signal'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Evaluaciones en línea',
                    handler : 'onEvaluaciones',
                    iconCls : 'fas fa-signal'
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
                    text    : 'Diario de campo',
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
                    text    : 'Formato guía o taller',
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
                    handler : 'onViewAusencias',
                    disabled: true,
                    iconCls : 'x-fa fa-spinner'
                }
            ]
        }
    ]
});
