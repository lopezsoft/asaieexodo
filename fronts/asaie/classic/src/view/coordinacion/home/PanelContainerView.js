/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.coordinacion.home.PanelContainerView',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Ext.ux.layout.ResponsiveColumn'
    ],
   controller  : 'Academico',

    alias   : 'widget.PanelContainerAcademicoCoorView',

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
                    text    : 'Asignaturas'+'</br>'+'académicas',
                    iconCls : 'x-fa fa-table',
                    itemId  : 'btnAsignaturas',
                    handler : 'onCreateAsignaturas'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Carga'+'</br>'+'académica',
                    itemId  : 'btnCarga',
                    handler : 'onCreateCarga',
                    iconCls : 'xi-courses-24'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Notas'+'</br>'+'reportadas',
                    itemId  : 'btnPrint',
                    handler : 'onNotasReportadas',
                    iconCls : 'xi-notes-24'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype: 'buttonPanel',
                    text: 'Cuadro' + '</br>' + 'de honor',
                    handler: 'onResult',
                    iconCls : 'xi-privilege-24'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype: 'buttonPanel',
                    text: 'Informes',
                    iconCls : 'x-fa fa-print',
                    handler : 'onViewReportes'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Ficha',
                    menu    : [
                        {
                            text    : 'Modelo (GEGOPEL)'
                        },
                        {
                            text    : 'Modelo (INESAT)'
                        }
                    ]
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype: 'buttonPanel',
                    text: 'Acceso'+'<br>'+'Estudiantes',
                    iconCls : 'x-fa fa-key',
                    tooltip : 'Permite generar o reestablecer los datos de acceso al personal estudiantíl.',
                    handler : function (btn) {
                        var
                            me  = Admin.getApplication(),
                            url = globales.SetUrls.UrlBase+'academic/get_update_pass_est';
                        me.onMsgWait();
                        Ext.Ajax.request({
                            url: url,

                            success: function(response, opts) {
                                me.onMsgClose();
                                me.showResult('Se ha realizado el proceso correntamente');
                            },

                            failure: function(response, opts) {
                                me.onMsgClose();
                                me.showResult('No se ha realizado el proceso correntamente');
                            }
                        });
                    }
                }
            ]
        }
    ]
});
