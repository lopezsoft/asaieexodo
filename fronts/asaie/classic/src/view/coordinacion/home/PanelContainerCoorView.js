/**
 * Created by LOPEZSOFT on 29/04/2016.
 */
Ext.define('Admin.view.coordinacion.home.PanelContainerCoorView', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],

    controller  : 'coordinacion',

    alias: 'widget.ContainerHomeCoorView',
    reference   : 'ContainerHomeCoorView',

    layout: 'responsivecolumn',

    items   : [
        {
            xtype   : 'containerButton'
        },
        {
            xtype   : 'containerButton'
        }
    ]
});