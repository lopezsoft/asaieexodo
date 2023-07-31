Ext.define('Admin.view.promocion.PromAnticipada',{
    extend      : 'Admin.forms.CustomForm',
    controller  : 'Promocion',
    title       : 'Estudiantes',
    alias       : 'widget.promocionanticipada',
    xtype       : 'promocionanticipada',
    itemId      : 'PromAnticipadaView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Promoción anticipada - '+ Global.getYear());
    },
    notGrupo    : [],
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    showSaveButton  : false,
    items   : [
        {
            xtype   : 'customcontainer',
            width   : 460,
            layout: {
                type: 'vbox'
			},
			scrollable	: true,
            margin      : 4,
            defaults	: {
                style: {
                    padding: '2px'
                }
            },
            items   : [
                {
                    xtype   : 'fieldset',
                    title   : 'Búsqueda de estudiantes a promover',
                    defaults : {
                        labelWidth	: 60
                    },
                    width   : 450,
					height  : 255,
					margin  : 4,
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
                            bind        : {
                                visible : '{comboGrupo.value}'
                            },
                            handler     : function (btn) {
								const win = btn.up('form'),
									me = Admin.getApplication();
								let extra = {
									pdbCodGrado	: win.down('#comboGrados').getValue(),
									pdbGrupo	: win.down('#comboGrupo').getValue(),
									pdbSede		: win.down('#comboSedes').getValue(),
									pdbJorn		: win.down('#comboJornadas').getValue(),
									pdbTable	: 'matriculas'
								};
                                me.setParamStore('MatriculadosStore',extra,true);
                            }
                        }
                    ]
                },
                {
                    xtype   : 'fieldset',
                    itemId  : 'Mat',
                    title   : 'Promover estudiantes a:',
					hidden  : true,
					margin  : 4,
                    defaults : {
                        labelWidth	: 60
                    },
                    width   : 450,
                    height  : 255,
                    items   : [
                        {
                            xtype       : 'CbSedes',
                            reference   : 'cbSedes',
                            itemId      : 'cbSedes',
							listeners: {
								select: function (cb, r) {
									let me = Admin.getApplication(),
										param = {
											pdbTable: 'jornadas',
											pdbSede: r.id,
											...Global.getSchoolParams(),
										};

									me.setParamStore('JornadasStore', param, true);

									param = {
										pdbTable    : 'grados',
										pdbSede     : r.id,
										...Global.getSchoolParams(),
									};
									me.setParamStore('GradosStore', param, true);
								}
							}
                        },
                        {
                            xtype       : 'CbJornadas',
                            reference   : 'cbJornadas',
                            bind    : {
                                visible : '{cbSedes.value}'
                            },
                            itemId      : 'cbJornadas'
                        },
                        {
                            xtype       : 'CbGrados',
                            reference   : 'cbGrados',
                            itemId      : 'cbGrados',
                            bind    : {
                                visible : '{cbJornadas.value}'
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
                            xtype       : 'customButton',
                            iconCls     : 'x-fa fa-check',
                            text        : 'Promover',
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
            title   : 'CONSULTA',
			      autoLoad    : false,
			      syncHeight  : false,
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
                'selectionchange': function(grid, selected) {
					const me = this;
					if (me.up('form').down('#Mat')) {
                        me.up('form').down('#Mat').setHidden(!selected.length);
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
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-eye',
                            text    : 'Ver promovidos',
                            handler : 'onPromovidos'
                        }
                    ]
                },
                {
                    xtype: 'pagination'
                }
            ]
        }
    ]
});
