/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.promocion.SabanaFinalesView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.sabanafinales',
    xtype       : 'sabanafinales',
    itemId      : 'SabanaFinalesView',
    controller  : 'Promocion',
    maxHeight      : 350,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Sabanas finales - '+ Global.getYear());
    },
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 80
            },
            items   : [
                {
                    xtype   : 'sedesJorn',
                        defaults: {
                            labelWidth  : 80
                        }
                },
                {
                    xtype   : 'CbGrupo'
                },
                {
                    xtype   : 'customcheckboxfield',
                    boxLabel: 'Generar todo el grado',
                    name    : 'generar'
                }
            ],
            dockedItems : [
                {
                    xtype   : 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-spinner',
                            text    : 'Generar',
                            bind    : {
                              disabled  : '{!comboJornadas.value}'
                            },
                            handler : function (btn) {
                                var
                                    win     = btn.up('window'),
                                    record  = win.down('form').getValues(),
                                    me      = Admin.getApplication(),
                                    gb      = Global;
                                win.mask('Procesando petición...');
                                Ext.Ajax.request({
                                    url     : gb.getUrlBase()+'General/get_generate_sabanas',
                                    params  : {
                                        pdbSede : record.id_sede,
                                        pdbGrado: record.id_grado,
                                        pdbJorn : record.cod_jorn,
                                        pdbGrupo: record.grupo,
                                        pdbAll  : record.generar
                                    },success: function(response, opts) {
                                        me.showResult('Proceso terminado correctamente.');
                                    },failure: function(response, opts) {
                                        me.onError('Error al procesar la petición.');
                                    },callback  : function(){
                                        win.unmask();
                                    }
                                });
                            }
                        },'-',
                        {
                            xtype	    : 'printButton',
                            disabled 	: false
                        },'-',
                        {
                            xtype	: 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});