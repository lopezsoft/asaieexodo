/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.coordinacion.home.PanelContainerCoorPromView',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Ext.ux.layout.ResponsiveColumn',
        'Admin.view.promocion.controller.PromocionController'
    ],
   controller  : 'Promocion',

    alias   : 'widget.PanelContainerPromocionCoorView',

    layout: 'responsivecolumn' ,

    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actas de'+'</br>'+'promoción',
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
                    text    : 'Sabanas'+'</br>'+'finales',
                    itemId  : 'btnOpen',
                    handler : 'onOpenTable',
                    iconCls : 'x-fa fa-book'
                }
            ]
        }
    ]
});
