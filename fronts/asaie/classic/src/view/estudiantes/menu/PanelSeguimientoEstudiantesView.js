/**
 * Created by LOPEZSOFT on 2/06/2016.
 */
Ext.define('Admin.view.estudiantes.menu.PanelSeguimientoEstudiantesView',{
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'estudiantes',
    alias       : 'widget.PanelSeguimientoEstudiantesView',
    reference   : 'PanelSeguimientoEstudiantesView',
    layout      : 'responsivecolumn',
    defaultType : 'containerButton',
    items   : [
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Observador'+'<br>'+'académico',
                    handler : '',
                    iconCls : 'x-fa fa-eye'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Reporte'+'<br>'+'disciplinario',
                    handler : '',
                    iconCls : 'x-fa fa-eye'
                }
            ]
        }
    ]
});