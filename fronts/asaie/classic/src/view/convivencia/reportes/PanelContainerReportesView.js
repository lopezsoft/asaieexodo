/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.convivencia.reportes.PanelContainerReportesView',{
    extend  : 'Admin.container.PanelContainerResponsive',
    controller  : 'convivencia',
    alias   : 'widget.PanelContainerReportesView',
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Consolidado'+'<br>'+'académico',
                    itemId  : 'btnConsolidado',
                    handler : 'onViewConsolidado',
                    iconCls : 'x-fa fa-print'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Estadísticas',
                    itemId  : 'btnFormatosAcciiones',
                    handler : 'onViewEstadistica',
                    iconCls : 'x-fa fa-level-up'
                }
            ]
        }
    ]
});
