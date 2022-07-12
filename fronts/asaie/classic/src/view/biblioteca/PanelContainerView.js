/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.biblioteca.PanelContainerView',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Ext.ux.layout.ResponsiveColumn'
    ],
   // controller  : 'representative',

    alias   : 'widget.PanelContainerBibliotecaView',

    layout: 'responsivecolumn' ,

    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel'
                }
            ]
        }
    ]
});
