/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.convivencia.coordinacion.PanelContainerView',{
    extend  : 'Admin.container.PanelContainerResponsive',
    controller  : 'convivencia',

    alias   : 'widget.PanelContainerCoordinacionView',
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Registro de'+'<br>'+'Situaciones'+'<br>'+'Tipo I',
                    itemId  : 'btnSituacionesTipoI',
                    handler : 'onViewSituacionesTipoI',
                    iconCls : 'x-fa fa-frown-o'

                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Registro de'+'<br>'+'Situaciones'+'<br>'+'Tipo II',
                    itemId  : 'btnSituacionesTipoII',
                    handler : 'onViewSituacionesTipoII',
                    iconCls : 'x-fa fa-frown-o'
                }
            ]
        }
    ]
});
