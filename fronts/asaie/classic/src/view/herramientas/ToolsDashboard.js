Ext.define('Admin.view.herramientas.ToolsDashboard',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    alias   : 'widget.toolsdashboard',
    layout: 'responsivecolumn' ,
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Datos del plantel',
                    iconCls : 'x-fa fa-cog',
                    itemId  : 'btnPanel',
                    handler : 'onPanelControl'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype       : 'buttonPanel',
                    text    : 'Infra estructura tecnológica',
                    iconCls : 'x-fa fa-table',
                    itemId  : 'btnVotacion',
                    tooltip : 'Mesas de votación',
                    handler : 'onMesasVotacion'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Sedes educativas',
                    iconCls : 'x-fa fa-users',
                    itemId  : 'btnCandidatos',
                    handler : 'onCandidatos'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Personal docente',
                    itemId  : 'btnOpen',
                    handler : 'onOpenTable'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Personal administrativo',
                    itemId  : 'btnPrint',
                    handler : 'onPrint'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Director de grupo',
                    itemId  : 'btnResult',
                    handler : 'onResult'
                }
            ]
        }
    ]
});
