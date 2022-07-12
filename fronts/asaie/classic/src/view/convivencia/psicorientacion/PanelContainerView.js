/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.convivencia.psicorientacion.PanelContainerView',{
    extend  : 'Admin.container.PanelContainerResponsive',
    controller  : 'convivencia',
    alias   : 'widget.PanelContainerPsicorientacionView',
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Registro de'+'<br>'+'Acciones'+'<br>'+' tipo I',
                    itemId  : 'btnAccionesTipoI',
                    handler : 'onAccionesTipoI',
                    iconCls : 'x-fa fa-frown-o'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Registro de'+'<br>'+'Acciones'+'<br>'+' tipo II',
                    itemId  : 'btnAccionesTipoII',
                    handler : 'onAccionesTipoII',
                    iconCls : 'x-fa fa-frown-o'
                }
            ]
        }
    ]
});
