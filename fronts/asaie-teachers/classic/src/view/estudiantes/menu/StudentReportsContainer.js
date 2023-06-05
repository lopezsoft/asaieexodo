Ext.define('Admin.view.estudiantes.menu.StudentReportsContainer',{
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'estudiantes',
    alias       : 'widget.studentreportscontainer',
    reference   : 'studentreportscontainer',
    layout      : 'responsivecolumn',
    defaultType : 'containerButton',
    items   : [
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Boletín periódico',
                    handler : 'onBoletin',
                    iconCls : 'x-fa fa-newspaper-o'
                }
            ]
        },
        {
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Consolidado académico',
                    itemId  : 'btnConsolidado',
                    handler : '',
                    disabled: true,
                    iconCls : 'x-fa fa-print'
                }
            ]
		},
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Certificado final de promoción',
                    itemId  : 'btnCertificadoFinal',
                    disabled: true,
                    handler : '',
                    iconCls : 'x-fa fa-graduation-cap"'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Informe final de promoción',
                    itemId  : 'btnLibroFinal',
                    handler : 'onLibroFinal',
                    iconCls : 'x-fa fa-graduation-cap"'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Constancias de estudio',
                    handler : 'onConstancias',
                    iconCls : 'x-fa fa-certificate"'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Documentos digitales',
                    handler : function (btn) {
                        var me  = Admin.getApplication();
                        me.onStore('docs.ImageBrowserStore');
                        var win = Ext.create({
                            xtype       : 'FilesView',
                            title       : 'Seleccionar archivo',
                            pathReadFile    : 'academic/read_files_dig_est',
                            pathUploadFile  : 'academic/upload_files_dig_est',
                            titlePanelLoad  : 'Subir archivos',
                            titlePanelView  : 'Mis archivos',
                            textButtonLoad  : 'Seleccionar una archivo en el equipo',
                            textButtonApply : 'Aceptar',
                            extraParams     : {
                                pdbCodEst   : Global.getData().user_parent
                            }
                        });
                        win.show();
                    },
                    iconCls : 'x-fa fa-archive"'
                }
            ]
        }
    ]
});
