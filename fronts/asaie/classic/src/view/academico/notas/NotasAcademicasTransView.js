/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.NotasAcademicasTransView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'academico',
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
    alias       : 'widget.NotasAcademicasTransView',
    items       : [
        {
            xtype: 'customform',
            showSaveButton : false,
            layout: {
                type    : 'hbox',
                align   : 'stretch'
            },
            items : [
                {
                    xtype   : 'customgrid',
                    store   : 'CandidatesSearchStore',
                    flex    : 4,
                    margin  : '0 1 0 0',
                    iconCls : '',
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
                            dataIndex   : 'grupo',
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
                            width       : 190,
                            filter      : 'list'
                        }
                    ],
                    dockedItems : [
                        {
                           xtype    : 'toolbarCrud',
                            items   : [
                                {
                                    xtype   : 'CbPeriodos',
                                    disabled: true,
                                    labelAlign: 'left',
                                    width   : 160
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
                                            result	= '',
                                            winMask         = btn.up('window'),
                                            data            = btn.up('grid').getSelection()[0],
                                            id_grade	    = data.get('id_grade'),
											cPeriodo		= winMask.down('#periodo').selection.get('periodo');
                                        cUrl            = Global.getUrlBase()+'c_sql/get_competencias';   
                                        winMask.mask(AppLang.getSMsgLoading());
                                        Ext.Ajax.request({
                                            url: cUrl,
                                            params : {
                                                idGrado: id_grade
                                            },
                                            success: function(response){
                                                result = Ext.decode(response.responseText);
                                                Global.setCompetences(result.records_comp);
                                                Global.setScale(result.records_des);
                                                Global.setColumnsNotes(result.records_colum);
                                                Global.setDbConfig(result.records_config);
                                                winMask.unmask();
                                                cTitle = AppLang.getSTitleViewAcademicNotes() + ' - ' + data.get('nombres') + ': ' + Global.getYear();
                                                var win = me.getWindow(null, 'Admin.view.academico.NotasTransView');
                                                win.setTitle(cTitle);
                                                win.show();
												ExExParams = {
													pdbCodGrado : id_grade,
													pdbPeriodo	: cPeriodo,
													pdbMatric   : data.get('id'),
													pdbTable	: '1'
												};
												me.setParamStore('NotasAcademicasStore',ExExParams,true);
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
                            xtype   : 'pagination'
                        }
                    ]
                }
            ]
        }
    ]
});
