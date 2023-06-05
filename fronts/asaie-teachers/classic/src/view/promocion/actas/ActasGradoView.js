/**
 * Created by LOPEZSOFT on 19/03/2016.
 */

Ext.define('Admin.view.promocion.ActasGradoView',{
    extend  : 'Admin.base.ReportViewBase',
    alias   :'widget.ActasGradoView',
    title   : 'Reportes',
    itemId  : 'ActasGradoView',
    maximized   : true,
    requires: [
        'Admin.store.general.MatriculadosStore'
    ],
    controller  : 'Promocion',
    items       : [
        {
            xtype   : 'customform',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items   : [
                {
                    xtype   : 'customform',
                    flex    : 3,
                    items   : [
                        {
                            xtype   : 'fieldset',
                            title   : 'Búsqueda de estudiantes',
                            defaults : {
                                labelWidth	: 110
                            },
                            items   : [
                                {
                                    xtype   : 'CbSedes'
                                },
                                {
                                    xtype   : 'CbGrados',
                                    bind    : {
                                        visible : '{comboSedes.value}'
                                    }
                                },
                                {
                                    xtype   : 'CbGrupo',
                                    bind    : {
                                        visible : '{comboGrados.value}'
                                    }
                                },
                                {
                                    xtype   : 'CbJornadas',
                                    bind    : {
                                        visible : '{comboGrupo.value}'
                                    }
                                },
                                {
                                    xtype       : 'radiogroup',
                                    fieldLabel  : 'Tipo de papel',
                                    columns     : 1,
                                    vertical    : false,
                                    labelStyle	: 'font-weight:bold',
                                    items   : [
                                        {
                                            boxLabel  : 'Hoja oficio',
                                            name      : 'hoja',
                                            inputValue: '1',
                                            checked   : true
                                        },
                                        {
                                            boxLabel  : 'Hoja carta',
                                            name      : 'hoja',
                                            inputValue: '2'
                                        }
                                    ]
                                },
                                {
                                    xtype       : 'radiogroup',
                                    fieldLabel  : 'Tipo',
                                    columns     : 1,
                                    vertical    : false,
                                    labelStyle	: 'font-weight:bold',
                                    items   : [
                                        {
                                            boxLabel  : 'Modelo1',
                                            name      : 'modelo',
                                            inputValue: '1',
                                            checked   : true
                                        },
                                        {
                                            boxLabel  : 'Modelo',
                                            name      : 'modelo',
                                            inputValue: '2'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    dockedItems : [
                        {}
                    ]
                },
                {
                    xtype   : 'customgrid',
                    store   : 'MatriculadosStore',
                    margin  : '0 1 0 0',
                    flex    : 4,
                    title   : 'CONSULTA',
                    autoLoad    : false,
                    plugins: [
                        {
                            ptype: 'rowexpander',
                            rowBodyTpl: new Ext.XTemplate(
                                '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                            )
                        },
                        {
                            ptype			: 'gridSearch',
                            readonlyIndexes	: ['note'],
                            disableIndexes	: ['pctChange'],
                            minChars		: 1,
                            mode            : 'local',
                            flex			: 1,
                            autoFocus		: false,
                            independent		: true
                        }
                    ],
                    listeners : {
                        'selectionchange': function(grid, selected, eOpts) {
                            var me = this;

                            if (me.up('window').down('#ckEst')) {
                                me.up('window').down('#ckEst').setDisabled(!selected.length);
                                if (selected.length == 0){
                                    me.up('window').down('#ckEst').setValue(false);
                                }
                            }
                        }
                    },
                    columns: [
                        {
                            xtype: 'rownumberer'
                        },
                        {
                            text: 'Apellidos y Nombres',
                            dataIndex: 'nombres',
                            width: 290
                        },
                        {
                            text: 'Grado',
                            dataIndex: 'grado',
                            width: 100
                        },
                        {
                            text: 'Grupo',
                            dataIndex: 'grupo',
                            width: 60
                        },
                        {
                            text: 'Jornada',
                            dataIndex: 'jornada',
                            width: 120
                        },
                        {
                            text: 'Sede',
                            dataIndex: 'sede',
                            width: 190
                        }
                    ],
                    dockedItems: [
                        {
                            xtype: 'toolbarCrud',
                            items: [
                                '->',
                                {
                                    xtype   : 'printButton'
                                },
                                '-',
                                {
                                    xtype: 'closebutton',
                                    iconAlign: 'left'
                                }
                            ]
                        }
                    ]
                }
            ],
            dockedItems : [
                {}
            ]
        }
    ],
    buttons : [
        {
            xtype       : 'customButton',
            iconCls     : 'x-fa fa-search',
            text        : 'Búscar',
            bind    : {
                disabled : '{!comboJornadas.value}'
            },
            handler     : function (btn) {
                var
                    win     = btn.up('window'),
                    me      = Admin.getApplication(),
                    store   = Ext.getStore('MatriculadosStore');

                extra   = {
                    pdbCodGrado : win.down('#comboGrados').getValue(),
                    pdbGrupo    : win.down('#comboGrupo').getValue(),
                    pdbSede     : win.down('#comboSedes').getValue(),
                    pdbJorn     : win.down('#comboJornadas').getValue(),
                    pdbTable    : 'matriculas'
                };

                me.setParamStore('MatriculadosStore',extra,true);

            }
        },'-',
        {
            xtype   : 'customButton',
            text    : 'Editar encabezado',
            iconCls : 'x-fa fa-pencil',
            handler : function (btn) {
                var
                    me  = Admin.getApplication(),
                    win = null,
                    m   = btn.up('window').getItemId();
                me.onMsgWait(AppLang.getSMsgLoading());
                Ext.require(
                    [
                        'Admin.view.promocion.ActaGradoEncSaveView',
                        'Admin.store.promocion.ActasPromEncStore'
                    ]
                );
                Ext.onReady(function (btn) {
                    me.onStore('promocion.ActasPromEncStore');
                    store = Ext.getStore('ActasPromEncStore');
                    store.reload({
                        callback : function (r, e) {
                            if (r.length > 0){
                                win     = me.getWindow('Edición de encabezado Acta de grado','Admin.view.promocion.ActaGradoEncSaveView');
                                form    = win.down('form');
                                form.loadRecord(r[0]);
                                win.show();
                            }else {
                                me.onError('Ha ocurrido un error');
                            }
                            me.onMsgClose();
                        }
                    });
                });
            }
        }
        ,'-',
        {
            xtype   : 'customButton',
            text    : 'Generar/Actualizar Libro Final',
            iconCls : 'x-fa fa-spinner',
            handler : function (btn) {
                var
                    me  = Admin.getApplication(),
                    gb  = globales.SetUrls,
                    win = btn.up('window'),
                    values  = win.down('form').getValues(),
                    param   = {
                        pdbGrado    : win.down('#comboGrados').getValue(),
                        pdbJorn     : win.down('#comboJornadas').getValue(),
                        pdbGrupo    : win.down('#comboGrupo').getValue(),
                        pdbSede     : win.down('#comboSedes').getValue(),
                        pdbAll      : 0,
                        pdbPer      : values.periodo
                    };
                me.onMsgWait('Generando...');
                Ext.Ajax.request({
                    url     : gb.UrlBase + 'reports/get_generate_libro',
                    params  : param,
                    timeout : 0,
                    success: function(response, opts) {
                        me.showResult('Se ha generado el libro.');
                    },
                    failure: function(response, opts) {
                        console.log('server-side failure with status code ' + response.status);
                    },
                    callback    : function (e, r) {
                        me.onMsgClose();
                    }
                });
            },
            bind    : {
                disabled : '{!comboJornadas.value}'
            }
        }
        /*{
            xtype   : 'customcheckboxfield',
            itemId  : 'ckEst',
            boxLabel: 'Imprimir estudiante seleccionado',
            disabled: true
        },*/

    ]
});