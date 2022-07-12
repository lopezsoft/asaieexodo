Ext.define('Admin.view.docentes.menu.PlanMejoramiento',{
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'recuperaciones',
    alias       : 'widget.planmejoramiento',
    xtype       : 'planmejoramiento',
    layout      : 'responsivecolumn',
    defaultType : 'containerButton',
    items   : [
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Nivelaciones periódicas',
                    handler : 'onViewRecPeriodica',
                    iconCls : 'x-fa fa-thumbs-up'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Nivelaciones de fin de año',
                    handler : 'onViewRecFinal',
                    iconCls : 'x-fa fa-thumbs-up'
                }
            ]
        }
    ]
});