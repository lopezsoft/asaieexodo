Ext.define('Admin.view.academico.AddCargaView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.AddCargaView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewCourses() + ' - ' + Global.getYear());
    },
    controller : 'academico',
    items : [
        {
            xtype: 'customform',
            bodyPadding: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaultType: 'custompanel',
            items: [
                {
                    flex        : 1,
                    bodyPadding : 2,
                    border      : false,
                    layout      : 'fit',
                    margin      : 2,
                    items: [
                        {
                            xtype: 'customgrid',
                            title: 'ASIGNATURAS POR GRADO',
                            itemId: 'gridMatCurso',
                            store: 'MatCursoStore',
                            plugins: [
                                {
                                    ptype: 'responsive'
                                },
                                {
                                    ptype: 'gridfilters'
                                },
                                {
                                    ptype: 'gridSearch',
                                    readonlyIndexes: ['note'],
                                    disableIndexes: ['pctChange'],
                                    minChars: 1,
                                    mode: 'local',
                                    flex: 1,
                                    autoFocus: false,
                                    independent: true
                                }
                            ],
                            listeners: {
								afterrender: function (ed) {
                                   const extra = {
                                        pdbTable: 'matcurso',
                                        pdbGrado: 0
                                    };
									Admin.getApplication().setParamStore('MatCursoStore', extra, true);
                                }
                            },
                            columns: [
                                {
                                    xtype: 'customrownumberer'
                                },
                                {
                                    text: 'Grado',
                                    dataIndex: 'grado',
                                    width: 170
                                },
                                {
                                    text: 'Asignatura(s)',
                                    dataIndex: 'asignatura',
                                    width: 250,
                                    filter: 'list'
                                },
                                {
                                    text: 'I/H',
                                    dataIndex: 'ih',
                                    width: 40,
                                    filter: 'list'
                                }
                            ],
                            dockedItems: [
                                {
                                    xtype: 'pagination',
                                    showExport: false,
                                    displayInfo: false,
                                    itemId: 'pToolbar'
                                }
                            ]
                        }

                    ]
                },
                {
                    flex        : 2,
                    bodyPadding : 2,
                    border      : false,
                    margin      : 2,
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            items: [
                                {
                                    xtype: 'CbSedes',
                                    listeners: {
                                        select: function (cb, r) {
                                            var
                                                me = Admin.getApplication(),                
                                                param = {
                                                    pdbTable    : 'jornadas',
                                                    pdbSede     : r.id
                                                };
                                            me.setParamStore('JornadasStore', param, true);
                    
                                        }
                                    }
                                },
                                {
                                    xtype       : 'CbJornadas',
                                    reference   : 'comboJornadas',
                                    bind: {
                                        visible: '{comboSedes.value}'
                                    }
                                },
                                {
                                    xtype       : 'CbGrupo',
                                    bind: {
                                        visible: '{comboJornadas.value}'
                                    },
                                    labelWidth  : 180,
                                    labelAlign  : 'left'
                                }
                            ]
                        },
                        {
                            xtype       : 'customgrid',
                            title       : 'LISTA DOCENTES',
                            selModel    : 'rowmodel',
                            itemId      : 'gridDocente',
                            plugins: [
                                {
                                    ptype: 'gridfilters'
                                },
                                {
                                    ptype: 'responsive'
                                },
                                {
                                    ptype: 'gridSearch',
                                    readonlyIndexes: ['note'],
                                    disableIndexes: ['pctChange'],
                                    minChars: 3,
                                    flex: 1,
                                    autoFocus: true,
                                    independent: true
                                }
                            ],
                            store: 'DocentesDirGrupoStore',
                            columns: [
                                {
                                    xtype: 'customrownumberer'
                                },
                                {
                                    text: 'DOCENTE',
                                    dataIndex: 'nombres',
                                    flex: 1,
                                    filter: 'string'
                                },
								{
									text: 'AÑO',
									dataIndex: 'year'
								}
                            ],
                            dockedItems: [
                                {
                                    xtype       : 'pagination',
                                    dock        : 'top',
                                    showExport: false,
                                    drisplayInfo: false,
                                    itemId: 'pDocToolbar'
                                }
                            ]
                        }
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbarSave',
                    items: [
                        {
                            xtype: 'facebookButton'
                        },
                        {
                            xtype: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype       : 'saveButton',
                            iconAlign   : 'left',
                            handler     : 'onSaveCarga'
                        }, '-',
                        {
                            xtype       : 'closebutton',
                            iconAlign   : 'left'
                        }
                    ]
                }
            ]

        }
    ]
});
