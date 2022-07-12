Ext.define('Admin.view.estudiantes.menu.PanelMejoramientoEstudiantesView',{
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'estudiantes',
    alias       : 'widget.PanelMejoramientoEstudiantesView',
    reference   : 'PanelMejoramientoEstudiantesView',
    layout      : 'responsivecolumn',
    defaultType : 'containerButton',
    items   : [
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Plan'+'<br>'+'periódico',
                    handler : '',
                    iconCls : 'x-fa fa-thumbs-up',
                    itemId  : 'btnRecPeriodica'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Plan de'+'<br>'+'fin de año',
                    handler : '',
                    iconCls : 'x-fa fa-thumbs-up',
                    itemId  : 'btnRecFinal'
                }
            ]
        }
    ]
});