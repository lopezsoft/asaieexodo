/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.convivencia.configuraciones.PanelContainerView',{
    extend  : 'Admin.container.PanelContainerResponsive',
    controller  : 'convivencia',

    alias   : 'widget.PanelContainerConfiguracionesView',
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Situacio'+'<br>'+'nes',
                    itemId  : 'btnSituaciones',
                    handler : 'onViewSituaciones'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Tipo de '+'<br>'+'Situaciones',
                    itemId  : 'btnTipoSituaciones',
                    handler : 'onViewSituacionesTipo'
                }
            ]
        }
    ]
});
