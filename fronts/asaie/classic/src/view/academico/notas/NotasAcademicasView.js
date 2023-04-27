/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.NotasAcademicasView',{
    extend      : 'Admin.base.WindowCrud',
    controller  : 'academico',
    title       : 'Estudiantes',
    initComponent: function () {
        var me  = Admin.getApplication();
        me.onStore('general.GradosStore');
        me.onStore('general.MatCursoStore');
        me.onStore('general.PeriodosStore');
        me.onStore('general.AsignaturaStore');
        me.onStore('general.CargaNotasStore');
        me.onStore('representative.CandidatesSearchStore');
        me.onStore('general.NotasAcademicasStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewAcademicNotes() + ' - ' + Global.getYear());
    },
    alias       : 'widget.notasAcademicasView',
    type        : 'notasAcademicasView',
    showSaveButton : false,
    items : [
        {
            xtype   : 'customTab',
            defaults: {
                scrollable  : false,
                border      : false,
                layout		: 'fit'
            },
            items   : [
                {
                    title   : 'Estudiantes',
                    items   : [
                        {
                            xtype   : 'customgrid',
                            store   : 'CandidatesSearchStore',
                            margin  : '0 1 0 0',
                            listeners: {
                                'selectionchange': function (grid, selected, eOpts) {
                                    var me = Admin.getApplication(),
                                        extra = [];

                                    if (this.down('#btnNotas')){
                                        this.down('#btnNotas').setDisabled(!selected.length);
                                    }
                                    this.down('#periodo').setDisabled(!selected.length);
                                    if (!Ext.isEmpty(selected)) {
                                        gdo = selected[0].get('id_grade');
                                        extra = {
                                            pdbTable: 'cursos',
                                            pdbGrado: gdo,
                                            pdbGrupo: selected[0].get('id_group'),
                                            pdbJorn : selected[0].get('id_study_day'),
                                            pdbSede: selected[0].get('id_headquarters')
                                        };

                                        me.setParamStore('CargaNotasStore', extra, true);
                                        extra = {
                                            pdbTable: 'periodos_academicos',
                                            pdbGrado: gdo,
                                            pdbType	: 0
                                        };
                                        me.setParamStore('PeriodosStore', extra);
                                    }

                                }
                            },
                            plugins		: [
                                {
                                    ptype: 'rowexpander',
                                    rowBodyTpl : new Ext.XTemplate(
                                        '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                                    )
                                },
                                {
                                    ptype : 'gridfilters'
                                },
                                {
                                    ptype			: 'gridSearch',
                                    readonlyIndexes	: ['note'],
                                    disableIndexes	: ['pctChange'],
                                    minChars		: 1,
                                    mode            : 'remote',
                                    flex			: 1,
                                    autoFocus		: true,
                                    independent		: true
                                }
                            ],
                            columns : [
                                {
                                    xtype       : 'customrownumberer'
                                },
                                {
                                    text        : 'Apellidos y Nombres',
                                    dataIndex   : 'nombres',
                                    width       : 290,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Grado',
                                    dataIndex   : 'grado',
                                    width       : 100,
                                    filter      : 'list'
                                },
                                {
                                    text        : 'Grupo',
                                    dataIndex   : 'id_group',
                                    width       : 60,
                                    filter      : 'list'
                                },
                                {
                                    text        : 'Jornada',
                                    dataIndex   : 'jornada',
                                    width       : 120,
                                    filter      : 'list'
                                },
                                {
                                    text        : 'Sede',
                                    dataIndex   : 'sede',
                                    width       : 250,
                                    filter      : 'list'
                                }
                            ],
                            dockedItems : [
                                {
                                    xtype    : 'toolbarCrud',
                                    items   : [
                                        {
                                            xtype: 'CbPeriodos',
                                            labelAlign: 'left',
                                            width   : 160,
                                            disabled: true
                                        },'-',
                                        {
                                            xtype       : 'customButton',
                                            itemId      : 'btnNotas',
                                            text        : 'Ver notas',
                                            iconCls     : 'x-fa fa-eye',
                                            disabled    : true,
                                            handler     : function (btn) {
                                                var cTitle 	= null,
                                                    me		= Admin.getApplication(),
                                                    result  = '',
                                                    winMask = btn.up('window'),
                                                    data            = btn.up('grid').getSelection()[0],
                                                    id_grade	    = data.get('id_grade'),
                                                    // cUrl = Global.getUrlBase() + 'c_sql/get_competencias';
													cUrl = Global.getApiUrl() + '/competence/competences';
                                                winMask.mask(AppLang.getSMsgLoading());
                                                Ext.Ajax.request({
                                                    url: cUrl,
                                                    params : {
                                                        idGrado: id_grade
                                                    },
                                                    success: function(response){
                                                        result 	= Ext.decode(response.responseText);
                                                        Global.setCompetences(result.records_comp);
                                                        Global.setScale(result.records_des);		
                                                        Global.setColumnsNotes(result.records_colum);
                                                        Global.setDbConfig(result.records_config);
                                                        winMask.unmask();
                                                        cTitle = AppLang.getSTitleViewAcademicNotes() + ' - ' + data.get('nombres') + ': ' + Global.getYear();
                                                        var win = me.getWindow(cTitle,'Admin.view.academico.NotasSaveView');
                                                        win.getController().onViewData(btn, win);
                                                        win.setTitle(cTitle);
                                                        win.show();
                                                    },
                                                    failure: function (response) {
                                                        winMask.unmask();
                                                        me.onAler('No se pueden cargar los datos');
                                                    }
                                                });
                                            }
                                        },
                                        '->',
                                        {
                                            xtype: 'closebutton',
                                            iconAlign	: 'left'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'pagination',
                                    showExport : false
                                }
                            ]
                        }
                    ]
                },
                {
                    title   : 'Asignación académica',
                    items   : [
                        {
                            xtype           : 'customgrid',
                            itemId          : 'gridCarga',
                            store           : 'CargaNotasStore',
                            allowDeselect   : true,
                            plugins: [
                                {
                                    ptype: 'responsive'
                                },
                                {
                                    ptype           : 'gridfilters'
                                }
                            ],
                            columns: [
                                {
                                    xtype: 'customrownumberer'
                                },
                                {
                                    text: 'Asignaturas',
                                    dataIndex: 'asignatura',
                                    flex: 1,
                                    filter: 'list'
                                },
                                {
                                    text: 'Docentes',
                                    dataIndex: 'docente',
                                    flex : 1,
                                    filter: 'list'
                                }
                            ],
                            listeners : {
                                'selectionchange': function(grid, selected, eOpts) {
                                    var me = this;

                                    if (me.down('#addButton')) {
                                        me.down('#addButton').setDisabled(!selected.length);
                                    }
                                }
                            },
                            dockedItems: [
                                {
                                    xtype: 'toolbarCrud',
                                    items: [
                                        {
                                            xtype       : 'addButton',
                                            iconAlign   : 'left',
                                            text        : 'Agegar asignaturas',
                                            tooltip     : 'Agegar asignaturas',
                                            disabled    : true,
                                            handler     : 'addAsginaturas'
                                        }
                                    ]
                                },
                                {
                                    xtype   : 'pagination',
                                    showExport: false,
                                    displayInfo : false,
                                    itemId  : 'pToolbar'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
