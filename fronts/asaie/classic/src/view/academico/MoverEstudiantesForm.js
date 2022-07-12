Ext.define('Admin.view.academico.MoverEstudiantesForm',{
    extend      : 'Admin.form.FormBase',
    alias       : 'widget.moverestudiantes',
    xtype       : 'moverestudiantes',
    controller  : 'academico',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewMoveStudents() + ' - ' + Global.getYear());
    },
    notGrupo    : [],
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    showSaveButton : false,
    items   : [
        {
			xtype   : 'container',
			scrollable			: true,
            flex    : 3,
            margin  : 2,
            items   : [
                {
                    xtype   : 'fieldset',
                    title   : 'Búsqueda de estudiantes a mover',
                    flex    : 2,
                    defaults : {
                        labelWidth	: 60
                    },
                    items   : [
                        {
                            xtype   : 'sedesJorn',
                            defaults : {
                                labelWidth	: 60
                            }
                        },
                        {
                            xtype   : 'CbGrupo',
                            bind    : {
                                visible : '{comboGrados.value}'
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
                                    win     = btn.up('form'),
                                    me      = Admin.getApplication(),
                                    store   = Ext.getStore('MatriculadosStore');

                                extra   = {
                                    pdbCodGrado : win.down('#comboGrados').getValue(),
                                    pdbGrupo    : win.down('#comboGrupo').getValue(),
                                    pdbSede     : win.down('#comboSedes').getValue(),
                                    pdbJorn     : win.down('#comboJornadas').getValue(),
                                    pdbTable    : 'student_enrollment'
                                };

                                me.setParamStore('MatriculadosStore',extra,true);
                                param = {
                                    pdbTable    : 'grados',
                                    pdbSede     : 0
                                };
                                me.setParamStore('GradosStore', param, true);

                            }
                        }
                    ]
                },
                {
                    xtype   : 'fieldset',
                    itemId  : 'Mat',
                    title   : 'Mover estudiantes a:',
                    hidden  : true,
                    defaults : {
                        labelWidth	: 60
                    },
                    flex    : 2,
                    margin  : 2,
                    items   : [
                        {
                            xtype       : 'CbSedes',
                            reference   : 'cbSedes',
                            name        : 'sedes_id',
                            itemId      : 'cbSedes'
                        },
                        {
                            xtype       : 'CbJornadas',
                            name        : 'jorn_id',
                            reference   : 'cbJornadas',
                            bind    : {
                                visible : '{cbSedes.value}'
                            },
                            itemId      : 'cbJornadas'
                        },
                        {
                            xtype       : 'CbGrados',
                            reference   : 'cbGrados',
                            name        : 'grados_id',
                            itemId      : 'cbGrados',
                            bind    : {
                                visible : '{cbJornadas.value}'
                            }
                        },
                        {
                            xtype       : 'CbGrupo',
                            reference   : 'cbGrupos',
                            name        : 'grupo_id',
                            bind    : {
                                visible : '{cbGrados.value}'
                            },
                            itemId      : 'cbGrupos'
                        },
                        {
                            xtype       : 'customcheckboxfield',
                            name        : 'move_notes',
                            boxLabel    : 'Mover con notas existentes',
                            itemId      : 'ckMoveNotes'
                        },
                        {
                            xtype       : 'customButton',
                            iconCls     : 'x-fa fa-check',
                            text        : 'Mover',
                            bind    : {
                                visible : '{cbGrupos.value}'
                            },
                            handler     : 'onMover'
                        }
                    ]	
                }
            ]
        },
        {
            xtype   : 'customgrid',
            store   : 'MatriculadosStore',
            margin  : '0 1 0 0',
			flex    : 4,
			syncHeight	: false,
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
                    if (me.up('form').down('#Mat')) {
                        me.up('form').down('#Mat').setHidden(!selected.length);
                    }
                }
            },
            columns: [
                {
                    xtype: 'customrownumberer'
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
                    dataIndex: 'id_group',
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
                    xtype: 'pagination',
                    displayInfo: false,
                    showExport  : false
                }
            ]
        }
    ]
});
