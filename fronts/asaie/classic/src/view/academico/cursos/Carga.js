/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.view.academico.Carga',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.carga',
    xtype   : 'carga',
    controller : 'academico',
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('general.GradosStore');
        me.onStore('general.AreasAsignaturaYearStore');
        me.onStore('general.MatCursoStore');
        me.onStore('general.CargaStore');
        me.onStore('general.GrupoStore');
        me.onStore('general.SedesStore');
        me.onStore('general.JornadasStore');
        me.onStore('admin.DocentesDirGrupoStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewCourses()+' - '+Global.getYear());
    },
    items : [
        {
            xtype : 'customTab',
            items : [
                {
                    title: 'Asignaturas por grado',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype   : 'customgrid',
                            itemId  : 'gridGrados',
                            plugins: [
                                {
                                    ptype: 'gridfilters'
                                },
                                {
                                    ptype: 'responsive'
                                }
                            ],
                            listeners: {
                                'selectionchange': function (grid, selected, eOpts) {
									let me = Admin.getApplication(),
										extra = [];
									let gdo;
									if (!Ext.isEmpty(selected)) {
										gdo = selected[0].get('id');
										extra = {
											pdbTable: 'matcurso',
											pdbGrado: gdo
										};
										me.setParamStore('MatCursoStore', extra, true);
									}

                                }
                            },
                            title: 'GRADOS ACADÉMICOS',
                            store: 'GradosStore',
                            margin: '0 3 0 0',
                            width    : 300,
                            collapseFirst   	: true,
                            collapseDirection   : 'left',
                            collapseMode        : 'undefined',
                            collapsible         : true,
                            columns: [
                                {
                                    xtype: 'customrownumberer'
                                },
                                {
                                    text		: 'Grados',
                                    dataIndex	: 'grado',
                                    flex		: 1,
                                    filter		: 'string'
                                }
                            ],
                            dockedItems: [
                                {
                                    xtype   : 'customToolbar',
                                    items   : [
                                        {
                                            xtype   : 'addButton',
                                            text	: 'Agregar asignaturas',
                                            tooltip	: 'Haga Click para agregar lasignaturas al grado seleccionado',
                                            iconAlign	: 'left',
                                            handler     : function (btn) {
                                               Ext.create('Admin.view.academico.AsignaturasAddCursoView',{
												   record	: btn.up('window').down('#gridGrados').getSelection()
											   }).show();
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'pagination',
                                    displayInfo: false,
                                    showExport: false,
                                    itemId: 'pToolbar'
                                }
                            ]
                        },
                        {
                            xtype	: 'customgrid',
                            flex	: 2,
                            title	: 'ASIGNATURAS POR GRADO',
                            itemId  : 'gridMatCurso',
                            store	: 'MatCursoStore',
                            allowDeselect : true,
                            listeners :{
                                'validateedit' : function (editor, e, eOpts ) {
                                    var
                                        win 	= this,
                                        btn1	= win.down('#btnUndo'),
                                        btn2    = win.down('#btnSaveAs2');
                                        btn1.setDisabled(false);
                                        btn2.setDisabled(false);
                                }
                            },
                            plugins: [
                                {
                                    ptype: 'responsive'
                                },
                                {
                                    ptype           : 'gridfilters'
                                },
                                {
                                    ptype			: 'cellediting',
                                    clicksToEdit	: 1,
                                    default         : 'textfield'
                                }
                            ],
                            columns: [
                                {
                                    xtype: 'customrownumberer'
                                },
                                {
                                    xtype: 'checkcolumn',
                                    text: 'Activo',
                                    dataIndex: 'estado',
                                    width: 85,
                                    headerCheckbox: true,
                                    stopSelection: false,
                                    editor      : {
                                        xtype: 'customcheckboxfield'
                                    }
                                },
                                {
                                    text: 'Grado',
                                    dataIndex: 'grado',
                                    width: 150
                                },
                                {
                                    text: 'Año',
                                    dataIndex: 'year',
                                    width: 55
                                },
                                {
                                    text: '%',
                                    dataIndex: 'porciento',
                                    width: 65,
                                    filter: 'list',
                                    editor      : {
                                        allowBlank		: false,
                                        selectOnFocus 	: true,
                                        emptyText		: '00.00',
                                        maskRe			: /[\d\.]/
                                    }
                                },
                                {
                                    text: 'I/H',
                                    dataIndex: 'ih',
                                    width: 40,
                                    filter: 'list',
                                    editor      : {
                                        allowBlank		: false,
                                        selectOnFocus 	: true,
                                        emptyText		: '00.00',
                                        maskRe			: /[\d\.]/
                                    }
                                },
                                {
                                    text: 'Asignatura(s)',
                                    dataIndex: 'asignatura',
                                    width: 300,
                                    filter: 'list'
                                },
                                {
                                    text: 'COGNITIVO %',
                                    dataIndex: 'proc1',
                                    width: 105,
                                    filter: 'list',
                                    editor      : {
                                        allowBlank		: true,
                                        selectOnFocus 	: true,
                                        emptyText		: '00.00',
                                        maskRe			: /[\d\.]/
                                    }
                                },
                                {
                                    text: 'LABORAL %',
                                    dataIndex: 'proc2',
                                    width: 100,
                                    filter: 'list',
                                    editor      : {
                                        allowBlank		: true,
                                        selectOnFocus 	: true,
                                        emptyText		: '00.00',
                                        maskRe			: /[\d\.]/
                                    }
                                },
                                {
                                    text: 'COMPORTAMENTAL %',
                                    dataIndex: 'proc3',
                                    width: 160,
                                    filter: 'list',
                                    editor      : {
                                        allowBlank		: true,
                                        selectOnFocus 	: true,
                                        emptyText		: '00.00',
                                        maskRe			: /[\d\.]/
                                    }
                                }
                            ],
                            dockedItems: [
                                {
                                    xtype: 'toolbarCrud',
                                    items: [
                                        {
                                            xtype   : 'saveButton',
                                            itemId  : 'btnSaveAs2',
                                            handler: function (btn) {
                                                var
                                                    store = Ext.getStore('MatCursoStore'),
                                                    me = Admin.getApplication(),
                                                    win 	= btn.up('window'),
                                                    btn1	= win.down('#btnUndo');
                                                store.sync({
                                                    success: function (batch, o) {
                                                        me.showResult('Se han guardado los datos');
                                                        btn1.setDisabled(true);
                                                        btn.setDisabled(true);
                                                    }
                                                });
                                            }
                                        },
                                        {
                                            xtype   : 'undoButton',
                                            itemId  : 'btnUndo',
                                            handler : function (btn) {
                                                var win 	= btn.up('window'),
                                                    store 	= Ext.getStore('MatCursoStore'),
                                                    btn1	= win.down('#btnSaveAs2');
                                                btn1.setDisabled(true);
                                                btn.setDisabled(true);
                                                store.rejectChanges();
                                            }
                                        }, '-',
                                        {
                                            xtype: 'deletebutton',
                                            handler : function (btn) {
                                                var cbtn = btn,
                                                    me	 = Admin.getApplication();

                                                Ext.Msg.show({
                                                    title	: 'Elimiar datos',
                                                    message	: 'Desea eliminar el registro?',
                                                    buttons	: Ext.Msg.YESNO,
                                                    icon	: Ext.Msg.QUESTION,
                                                    fn: function(btn) {
                                                        if (btn === 'yes') {
                                                            me.onMsgWait();
                                                            var grid 	= cbtn.up('#gridMatCurso'),
                                                                records = grid.getSelectionModel().getSelection(),
                                                                store 	= grid.getStore() ;
                                                            store.remove(records);
                                                            store.sync({
                                                                success : function (b, o) {
                                                                    Ext.Msg.hide();
                                                                    me.showResult('Se ha realizado la acción de borrado');
                                                                    store.reload();
                                                                },
                                                                failure : function (b, o) {
                                                                    Ext.Msg.hide();
                                                                    me.showResult('No se ha realizado la acción de borrado');
                                                                    store.reload();
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        }, '-',
                                        {
                                            xtype: 'closebutton'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'pagination',
                                    itemId: 'pToolbar'
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'Asignación académica',
                    layout: 'fit',
                    defaults: {
                        width: '100%'
                    },
                    items: [
                        {
                            xtype           : 'customgrid',
                            itemId          : 'gridCarga',
                            store           : 'CargaStore',
                            allowDeselect   : false,
                            listeners :{
                                selectionchange : function(grid, selected) {
									const me = this;
									if (me.down('#saveButton')){
                                        me.down('#saveButton').setDisabled(!selected.length);
                                    }
                                    if (me.down('#editButton')){
                                        me.down('#editButton').setDisabled(!selected.length);
                                    }
                                    if (me.down('#btnDeleteGrid')) {
                                        me.down('#btnDeleteGrid').setDisabled(!selected.length);
                                    }
                                },
                                validateedit : function () {
                                    this.down('#btnUndoCarga').setDisabled(false);
                                    this.down('#btnSaveCarga').setDisabled(false);
                                }
                            },
                            plugins: [
                                {
                                    ptype: 'responsive'
                                },
                                {
                                    ptype           : 'gridfilters'
                                },
                                {
                                    ptype			: 'cellediting',
                                    clicksToEdit	: 1,
                                    default         : 'textfield'
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
							actions: {
								docente : {
									tooltip: 'Cambiar docente',
									iconCls: 'x-fa fa-pencil',
									handler: function (grid, rowIndex) {
										const win = grid.up('window'),
											rec = grid.getStore().getAt(rowIndex),
											me = Admin.getApplication(),
											btn1 = win.down('#btnUndoCarga'),
											btn2 = win.down('#btnSaveCarga');
										me.onStore('admin.DocentesDirGrupoStore');
                                        if (btn1.isDisabled()) {
                                            btn1.setDisabled(false);
                                        }
                                        if (btn2.isDisabled()) {
                                            btn2.setDisabled(false);
										}
										Ext.create('Admin.view.academico.DocentesChangeView',{
											record	: rec
										}).show();
									}
								},
								asignatura : {
									tooltip: 'Cambiar asignatura',
									iconCls: 'x-fa fa-pencil',
									handler: function (grid, rowIndex) {
										const win = grid.up('window'),
											rec = grid.getStore().getAt(rowIndex),
											me = Admin.getApplication(),
											btn1 = win.down('#btnUndoCarga'),
											btn2 = win.down('#btnSaveCarga');
										me.onStore('general.AreasAsignaturaYearStore');
										if (btn1.isDisabled()) {
											btn1.setDisabled(false);
										}
										if (btn2.isDisabled()) {
											btn2.setDisabled(false);
										}
										Ext.create('Admin.view.academico.AsignaturasChangeView', {
											record	: rec
										}).show();
									}
								},
								jorn : {
									tooltip: 'Cambiar jornada',
									iconCls: 'x-fa fa-pencil',
									handler: function (grid, rowIndex) {
										const win = grid.up('window'),
											rec = grid.getStore().getAt(rowIndex),
											me = Admin.getApplication(),
											btn1 = win.down('#btnUndoCarga'),
											btn2 = win.down('#btnSaveCarga');
										me.onStore('general.JornadasStore');
										if (btn1.isDisabled()) {
											btn1.setDisabled(false);
										}
										if (btn2.isDisabled()) {
											btn2.setDisabled(false);
										}
										Ext.create('Admin.view.academico.JornadasChangeView', {
											record	: rec
										}).show();
									}
								},
								grado : {
									tooltip: 'Cambiar grado',
									iconCls: 'x-fa fa-pencil',
									handler: function (grid, rowIndex, colIndex) {
										const win = grid.up('window'),
											rec = grid.getStore().getAt(rowIndex),
											me = Admin.getApplication(),
											btn1 = win.down('#btnUndoCarga'),
											btn2 = win.down('#btnSaveCarga');
										me.onStore('general.GradosStore');
										const win2 = Ext.create('Admin.view.academico.GradosChangeView'),
											form = win2.down('form');
										if (btn1.isDisabled()) {
											btn1.setDisabled(false);
										}
										if (btn2.isDisabled()) {
											btn2.setDisabled(false);
										}
										form.loadRecord(rec);
										win2.show();
									}
								},
								grupo : {
									tooltip: 'Cambiar grupo',
									iconCls: 'x-fa fa-pencil',
									handler: function (grid, rowIndex) {
										const win = grid.up('window'),
											rec = grid.getStore().getAt(rowIndex),
											me = Admin.getApplication(),
											btn1 = win.down('#btnUndoCarga'),
											btn2 = win.down('#btnSaveCarga');
										me.onStore('general.GrupoStore');
										const win2 = Ext.create('Admin.view.academico.GruposChangeView'),
											form = win2.down('form');
										if (btn1.isDisabled()) {
											btn1.setDisabled(false);
										}
										if (btn2.isDisabled()) {
											btn2.setDisabled(false);
										}
										form.loadRecord(rec);
										win2.show();
									}
								}
							},
                            columns: [
                                {
                                    xtype: 'customrownumberer'
                                },
								{
									xtype: 'checkcolumn',
									text: 'Activo',
									dataIndex: 'estado',
									width: 85,
									headerCheckbox: true,
									stopSelection: false,
									editor      : {
										xtype: 'customcheckboxfield'
									}
								},
                                {
                                    text        : 'Grado',
                                    dataIndex   : 'grado',
                                    width       : 170,
                                    filter      : 'list'
                                },
                                {
                                    text        : 'Grupo',
                                    dataIndex   : 'grupo',
                                    width       : 60,
                                    filter      : 'list'
                                },
                                {
                                    text: 'Año',
                                    dataIndex: 'year',
                                    width: 55
                                },
                                {
                                    text: 'Asignatura(s)',
                                    dataIndex: 'asignatura',
                                    width: 300,
                                    filter: 'list'
                                },
								{
									menuDisabled	: true,
									sortable		: false,
									xtype			: 'actioncolumn',
									width			: 30,
									items			: ['@asignatura']
								},
                                {
                                    text: 'Docentes',
                                    dataIndex: 'docente',
                                    width: 300,
                                    filter: 'list'
                                },
								{
									menuDisabled	: true,
									sortable		: false,
									xtype			: 'actioncolumn',
									width			: 30,
									items			: ['@docente']
								},
                                {
                                    text: 'Sede',
                                    dataIndex: 'sede',
                                    width: 300,
                                    filter: 'list'
                                },
                                {
                                    text        : 'Jornada',
                                    dataIndex   : 'jornada',
                                    width       : 120,
                                    filter      : 'list'
                                },
								{
									menuDisabled	: true,
									sortable		: false,
									xtype			: 'actioncolumn',
									width			: 30,
									items			: ['@jorn']
								},
                            ],
                            dockedItems: [
                                {
                                    xtype: 'customToolbar',
                                    items: [
                                        {
                                            xtype: 'CbGrados',
                                            width: 350,
                                            labelWidth: 60,
                                            labelAlign: 'left',
                                            listeners: {
                                                select: function (cb, record, eOpts) {
                                                    var me = Admin.getApplication(),
                                                        extra = [];
                                                    if (!Ext.isEmpty(record)) {
                                                        gdo = record.get('id');
                                                        extra = {
                                                            pdbTable: 'cursos',
                                                            pdbGrado: gdo
                                                        };
                                                        me.setParamStore('CargaStore', extra, true);
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'toolbarCrud',
                                    items: [
                                        {
                                            xtype   : 'saveButton',
                                            itemId  : 'btnSaveCarga',
                                            handler: function (btn) {
												const store = Ext.getStore('CargaStore'),
													me = Admin.getApplication(),
													win = btn.up('window'),
													btn1 = win.down('#btnUndoCarga');
												win.mask('Guardando datos...');
												store.sync({
                                                    success: function (batch, o) {
                                                        me.showResult('Se han guardado los datos');
                                                        btn1.setDisabled(true);
														store.reload();
                                                        btn.setDisabled(true);
														win.unmask();
                                                    },
													failure: function (batch, o) {
														win.unmask();
													}
                                                });
                                            }
                                        },
                                        {
                                            xtype   : 'undoButton',
                                            itemId  : 'btnUndoCarga',
                                            handler : function (btn) {
												const win = btn.up('window'),
													store = Ext.getStore('CargaStore'),
													btn1 = win.down('#btnSaveCarga');
												btn1.setDisabled(true);
                                                btn.setDisabled(true);
                                                store.rejectChanges();
                                            }
                                        },'-',
                                        {
                                            xtype   : 'deletebutton',
                                            itemId  : 'btnDeleteGrid',
                                            handler : function (btn) {
												const cbtn = btn,
													me = Admin.getApplication();
												Ext.Msg.show({
                                                    title	: 'Eliminar datos',
                                                    message	: 'Desea eliminar el registro?',
                                                    buttons	: Ext.Msg.YESNO,
                                                    icon	: Ext.Msg.QUESTION,
                                                    fn: function(btn) {
                                                        if (btn === 'yes') {
                                                            me.onMsgWait();
															const grid = cbtn.up('#gridCarga'),
																records = grid.getSelectionModel().getSelection(),
																store = grid.getStore();
															store.remove(records);
                                                            store.sync({
                                                                success : function (b, o) {
                                                                    Ext.Msg.hide();
                                                                    me.showResult('Se ha realizado la acción de borrado');
                                                                    store.reload();
                                                                },
                                                                failure : function (b, o) {
                                                                    Ext.Msg.hide();
                                                                    me.showResult('No se ha realizado la acción de borrado');
                                                                    store.reload();
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        }, '-',
                                        {
                                            xtype: 'addButton',
                                            text: 'Asignar',
                                            tooltip: 'Haga Click para agregar la asignación académica',
                                            iconAlign: 'left',
                                            handler: function (btn) {
                                                const win = Ext.create('Admin.view.academico.AddCargaView');
                                                win.on('closed',function(){
													let param = {
														pdbTable: 'grados',
														pdbSede: 0
													};
                                                    Admin.getApplication().setParamStore('GradosStore', param, true);
                                                });
                                                win.show();
                                            }
                                        },'-',
                                        {
                                            xtype: 'closebutton'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'pagination',
                                    itemId: 'pToolbar'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
