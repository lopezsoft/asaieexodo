/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.TransferirNotasView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'Academico',
    title       : 'Estudiantes',
    alias       : 'widget.TransferirNotasView',
    itemId      : 'TransferirNotasView',
    maximized   : true,
    notGrupo    : [],
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
                            title   : 'Búsqueda de estudiantes a transferir notas',
                            defaults : {
                                labelWidth	: 70
                            },
                            flex    : 2,
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
                                    xtype       : 'customButton',
                                    iconCls     : 'x-fa fa-search',
                                    text        : 'Búscar',
                                    bind    : {
                                        visible : '{comboJornadas.value}'
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
                                }
                            ]
                        },
                        {
                            xtype   : 'fieldset',
                            itemId  : 'Mat',
                            title   : 'Transferir notas a:',
                            hidden  : true,
                            defaults : {
                                labelWidth	: 60
                            },
                            flex    : 2,
                            items   : [
                                {
                                    xtype       : 'CbSedes',
                                    reference   : 'cbSedes',
                                    itemId      : 'cbSedes'
                                },
                                {
                                    xtype       : 'CbGrados',
                                    reference   : 'cbGrados',
                                    itemId      : 'cbGrados',
                                    bind    : {
                                        visible : '{cbSedes.value}'
                                    }
                                },
                                {
                                    xtype       : 'CbGrupo',
                                    reference   : 'cbGrupos',
                                    bind    : {
                                        visible : '{cbGrados.value}'
                                    },
                                    itemId      : 'cbGrupos'
                                },
                                {
                                    xtype       : 'CbJornadas',
                                    reference   : 'cbJornadas',
                                    bind    : {
                                        visible : '{cbGrupos.value}'
                                    },
                                    itemId      : 'cbJornadas'
                                },
								{
									xtype   : 'CbPeriodos',
									bind    : {
										visible : '{cbJornadas.value}'
									}
								},'-',
                                {
                                    xtype       : 'customButton',
                                    iconCls     : 'x-fa fa-check',
                                    text        : 'Transferir',
                                    bind    : {
                                        visible : '{periodo.value}'
                                    },
                                    handler     : 'onTransferir'
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

                            if (me.up('window').down('#Mat')) {
                                me.up('window').down('#Mat').setHidden(!selected.length);
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
                                '-',
                                {
                                    xtype: 'closebutton',
                                    iconAlign: 'left'
                                }
                            ]
                        },
                        {
                            xtype: 'pagination'
                        }
                    ]
                }
            ],
            dockedItems : [
                {}
            ]
        }
    ]
});
