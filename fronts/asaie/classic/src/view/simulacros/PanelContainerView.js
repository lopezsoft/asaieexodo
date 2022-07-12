/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.simulacros.PanelContainerView',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Admin.view.simulacros.controller.SimulacrosController',
        'Ext.ux.layout.ResponsiveColumn'
    ],
   controller  : 'Simulacros',

    alias   : 'widget.PanelContainerSimulacrosView',

    layout: 'responsivecolumn' ,

    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype       : 'buttonPanel',
                    text    : 'Áreas'+'</br>'+'académicas',
                    iconCls : 'x-fa fa-table',
                    itemId  : 'btnAreas',
                    handler : 'onCreateAreas'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Pruebas'+'</br>'+' y sesiones',
                    iconCls : 'x-fa fa-question-circle-o',
                    itemId  : 'btnPruebas',
                    handler : 'onSesionPruebas'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Banco'+'</br>'+' de preguntas',
                    iconCls : 'x-fa fa-university',
                    itemId  : 'btnPruebas',
                    handler : ''
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype: 'buttonPanel',
                    text: 'Resultados',
                    iconCls : 'x-fa fa-print',
                    handler : ''
                }
            ]
        }
    ]
});
