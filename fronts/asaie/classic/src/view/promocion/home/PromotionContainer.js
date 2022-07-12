Ext.define('Admin.view.promocion.PromotionContainer',{
    extend  : 'Ext.container.Container',
    controller  : 'Promocion',
    alias   : 'widget.promocion',
    xtype   : 'promocion',
    layout: 'responsivecolumn' ,
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actividades de apoyo',
                    iconCls : 'x-fa fa-cog',
                    handler : 'onNivelaciones'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Informe final de promoción',
                    iconCls : 'x-fa fa-book',
                    handler : 'onLibroFinal'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actas de promoción',
                    iconCls : 'x-fa fa-users',
                    handler : 'onActas'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actas de promoción estadística',
                    iconCls : 'x-fa fa-users',
                    handler : 'onActasEstadistica'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Sabanas finales',
                    handler : 'onSabanas',
                    iconCls : 'x-fa fa-book'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Promoción anticipada',
                    handler : 'onPromAnti',
                    iconCls : 'x-fa fa-graduation-cap'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Certificado de promoción',
                    handler : 'onCertificado',
                    iconCls : 'x-fa fa-certificate'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Cerrar año lectivo',
                    handler : function (btn) {
                        var
                            me  = Admin.getApplication(),
                            gb  = Global,
                            cUrl= gb.getUrlBase() + 'c_cierre/get_close';
                        me.onMsgWait();
                        Ext.Ajax.request({
                            url     : cUrl ,
                            timeout : 300000,
                            success: function(response, opts) {
                                me.showResult('Cierre completo');
                            },
                            failure: function(response, opts) {
                                me.onError('Error');
                            },
                            callback    : function (res) {
                                me.onMsgClose();
                            }
                        });
                    },
                    iconCls : 'x-fa fa-calendar'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Matricular antiguos',
                    handler : 'onViewAntiguos',
                    iconCls : 'x-fa fa-graduation-cap'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Actas de grado',
					disabled: true,
                    handler : 'onActaGrado',
                    iconCls : 'x-fa fa-graduation-cap'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Historial académico',
                    handler : 'onHistorilaAca',
                    iconCls : 'x-fa fa-graduation-cap'
                }
            ]
        }
    ]
});
