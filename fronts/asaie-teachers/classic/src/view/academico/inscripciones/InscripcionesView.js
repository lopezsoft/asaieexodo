Ext.define('Admin.view.academico.inscripciones.InscripcionesView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.inscripcionesView',
    xtype   : 'inscripcionesView',
    controller: 'academico',
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('general.DocumentosStore');
        me.onStore('general.CountryStore');
        me.onStore('general.CitiesStore');
        me.onStore('general.CitiesStore2');
        me.onStore('general.CitiesStore3');
        me.onStore('general.PoblacionatendidaStore');
        me.onStore('general.RHStore');
        me.onStore('general.EstratoStore');
        me.onStore('general.ZonaStore');
        me.onStore('general.SedesStore');
        me.onStore('general.GradosStore');
        me.onStore('general.GrupoStore');
        me.onStore('general.JornadasStore');
        me.onStore('general.EstadoStore');
        me.onStore('inscripciones.MatriculasStore');
        me.onStore('inscripciones.InscripcionesStore');
        me.onStore('inscripciones.ExtraInscripcionesStore');
        me.onStore('inscripciones.FamiliesStudentStore');
        me.onStore('inscripciones.HistorialStore');
        this.setTitle(AppLang.getSTitleViewStudents());
        this.callParent(arguments);
    },
    buildWindow: function () {
        this.winObject = Ext.create('Admin.view.academico.inscripciones.forms.InscripcionesForm');
    },
    showWindow: function (btn) {
        var
            ts = this,
            data = ts.down('grid').getSelection()[0],
            form = [];

        if (!ts.getWinObject()) {
            ts.buildWindow();
        }
        form = ts.winObject.down('form');
        if (btn.itemId === 'editButton') {
            form.loadRecord(data);
            form.down('#FsMatricula').setHidden(true);
            form.down('#comboSedes').allowBlank = true;
            form.down('#comboJornadas').allowBlank = true;
            form.down('#comboGrados').allowBlank = true;
            form.down('#comboGrupo').allowBlank = true;
        } else {
            form.reset(true);
            form.down('#FsMatricula').setHidden(false);
            form.down('#comboSedes').allowBlank = false;
            form.down('#comboJornadas').allowBlank = false;
            form.down('#comboGrados').allowBlank = false;
            form.down('#comboGrupo').allowBlank = false;
        };
        ts.winObject.show();
    },
    showSaveButton  : false,
    items: [
        {
            xtype   : 'customTab',
            frame   : true,
            bodyPadding: 1,
            defaults: {
                scrollable  : false,
                border      : false,
                layout		: 'fit'
            },
            items: [
                {
                    title       : 'Inscripciones',
                    items   : [
                        {
                            xtype       : 'customgrid',
                            itemId      : 'studentgrid',
                            selModel    : 'rowmodel',
                            syncHeight  : false,
                            plugins		: [
                                {
                                    ptype : 'gridfilters'
                                },
                                {
                                    ptype : 'responsive'
                                },
                                {
                                    ptype			: 'gridSearch',
                                    readonlyIndexes	: ['note'],
                                    disableIndexes	: ['pctChange'],
                                    mode            : 'remote',
                                    flex			: 1,
                                    autoFocus		: true,
                                    independent		: true
                                }
                            ],
                            store       : 'InscripcionesStore',
                            listeners   : {
                                'selectionchange': function(mo, selected, eOpts) {
									const me = Admin.getApplication(),
										ts = this;
									let xparam;
									if (selected[0]) {
										xparam = {
											id_student: selected[0].get('id'),
											pdbTable: 'student_enrollment'
										};
									} else {
										xparam = {
											id_student: 0,
											pdbTable: 'student_enrollment'
										};
									}
                                    me.setParamStore('HistorialStore', xparam, true);
                                    ts.up('window').down('#tab2').setDisabled(!selected);
                                }
                            },
                            columns     : [
                                {
                                    xtype   : 'customrownumberer'
                                },
                                {
                                    text        : 'Código',
                                    dataIndex   : 'id',
                                    width       : 80,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Apellidos',
									columns		: [
										{
											text 		: 'Primer',
											dataIndex   : 'apellido1',
											filter      : 'string'
										},
										{
											text 		: 'Segundo',
											dataIndex   : 'apellido2',
											filter      : 'string'
										}
									]
                                },
								{
                                    text        : 'Nombres',
									columns		: [
										{
											text 		: 'Primer',
											dataIndex   : 'nombre1',
											filter      : 'string'
										},
										{
											text 		: 'Segundo',
											dataIndex   : 'nombre2',
											filter      : 'string'
										}
									]
                                },
                                {
                                    text        : 'Documento',
                                    dataIndex   : 'nro_documento',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Dirección',
                                    dataIndex   : 'direccion',
                                    width       : 200,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'F. Nacimiento',
                                    dataIndex   : 'fecha_nacimiento',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Edad',
                                    dataIndex   : 'edad',
                                    width       : 55,
                                    filter      : 'string'
                                }
                            ],
                            dockedItems : [
                                {
                                    xtype   : 'toolbarCrud',
                                    items   : [
                                        '->',
                                        {
                                            xtype   : 'addButton'
                                        },'-',
                                        {
                                            xtype   : 'editButton'
                                        },'-',
                                        {
                                            xtype   : 'deletebutton'
                                        },'-',
                                        {
                                            xtype   : 'closebutton'
                                        },'-',
                                        {
                                            xtype   : 'customButton',
                                            text    : 'Datos extra',
                                            itemId  : 'extrabutton',
                                            disabled: true,
                                            handler : function(btn){
                                                let ts      = this.up('window');
												let app = Admin.getApplication();
												let store = Ext.getStore('ExtraInscripcionesStore'),
													record = ts.down('#studentgrid').getSelection()[0];
                                                const xparam  = {
                                                    pdbTable    : 'extra_inscripciones',
                                                    where       : '{"id_inscripcion" : "'+record.get('id')+'"}'
                                                };
                                                app.setParamStore('ExtraInscripcionesStore',xparam,false);
                                                ts.mask(AppLang.getSMsgLoading());
                                                store.load({
                                                    scope: this,
                                                    callback: function(records, operation, success) {
                                                        ts.unmask();
														let win;
														if (success) {
															win = Ext.create('Admin.view.academico.inscripciones.ExtraInscripciones');
															const form = win.down('form');
															if (records.length === 1) {
																form.loadRecord(records[0]);
															}
															win.setRecord(record);
															win.setAlwaysOnTop(true).show();
														}
                                                    }
                                                });
                                            },
                                            tooltip : 'Datos ediciones del estudiante',
                                            iconCls : 'fas fa-id-card'
                                        }, '-',
                                        {
                                            xtype       : 'customButton',
                                            tooltip     : 'Familiares asignados al estudiante',
                                            iconCls     : 'x-fa fa-users',
                                            text        : 'Familiares',
                                            itemId      : 'btnFamil',
                                            disabled  	: true,
                                            handler     : 'onFamiliesStudent'
                                        },
                                        {
                                            xtype       : 'customButton',
                                            tooltip     : 'Crear Familiares',
                                            text        : 'Crear Familiares',
                                            iconCls     : 'x-fa fa-users',
                                            handler     : 'onFamilies'
                                        },
                                        {
                                            xtype       : 'customButton',
                                            tooltip     : 'Documentos digitales',
                                            itemId      : 'btnDocDig',
                                            disabled  	: true,
                                            iconCls     : 'x-fa fa-book',
                                            handler     : 'onViewArchivos'
                                        },
                                        {
                                            xtype   : 'customButton',
                                            ui      : 'soft-green',
                                            iconCls : 'x-fa fa-cloud-download',
                                            tooltip : 'Exportar plantilla excel para importar lista de estudiantes',
                                            handler : 'onDownloadExcelStudents'
                                        },
                                        {
                                            xtype   : 'customButton',
                                            ui      : 'soft-green',
                                            iconCls : 'x-fa fa-cloud-upload',
                                            tooltip : 'Importar listados de estudiantes a inscribir y matricular',
                                            handler : 'onLoadExcelStudents'
                                        }
                                    ]
                                },
                                {
                                    xtype 		: 'pagination'
                                }
                            ]
                        }
                    ]
                },
                {
                    title   : 'Matriculas',
                    itemId  : 'tab2',
                    disabled: true,
                    items: [
                        {
                            xtype       : 'customgrid',
                            store       : 'HistorialStore',
                            syncHeight  : false,
                            itemId      : 'gridMat',
                            selModel    : 'rowmodel',
                            plugins		: [
                                {
                                    ptype : 'gridfilters'
                                },
                                {
                                    ptype : 'responsive'
                                }
                            ],
                            autoLoad    : false,
                            columns     : [
                                {
                                    xtype   : 'customrownumberer',
                                    width   : 25
                                },
                                {
                                    text        : 'Código',
                                    dataIndex   : 'id',
                                    width       : 85,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Año',
                                    dataIndex   : 'year',
                                    width       : 55,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Grado',
                                    dataIndex   : 'grado',
                                    width       : 130,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Grupo',
                                    dataIndex   : 'id_group',
                                    width       : 60,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Jornada',
                                    dataIndex   : 'jornada',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Fecha',
                                    dataIndex   : 'date',
                                    width       : 90
                                },
                                {
                                    text        : 'Sede',
                                    dataIndex   : 'sede',
                                    flex 		: 1,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Estado',
                                    dataIndex   : 'name_state',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Mensaje',
                                    dataIndex   : 'msg',
                                    filter      : 'list',
                                    width       : 150
                                }
                            ],
                            dockedItems : [
                                {
                                    xtype   : 'customToolbar',
                                    items: [
                                        '->',
                                        {
                                            xtype   : 'addButton',
                                            itemId  : 'btnNewMat',
                                            handler : 'onMatricula',
                                            tooltip : 'Matricula',
                                            iconCls : 'x-fa fa-graduation-cap'
                                        }, '-',
                                        {
                                            xtype   : 'editButton',
                                            itemId  : 'btnMatricula',
                                            handler : 'onMatricula',
                                            tooltip : 'Matricula',
                                            iconCls : 'x-fa fa-graduation-cap'
                                        }, '-',
                                        {
                                            xtype   : 'addButton',
                                            itemId  : 'noveltyButton',
                                            handler : 'onNovelty',
                                            disabled: true,
                                            tooltip :  AppLang.getSTitleViewNovelty(),
                                            text    :  AppLang.getSButtonNovelty(),
                                            iconCls : 'x-fa fa-graduation-cap'
                                        }, '-',
                                        {
                                            xtype   : 'printButton',
                                            tooltip : 'Imprimir ficha'
                                        },'-',
                                        {
                                            xtype   : 'deletebutton',
                                            handler : function (btn) {
                                                var cbtn = btn,
                                                    me	 = Admin.getApplication();
                                                Ext.Msg.show({
                                                    title	: 'Eliminar matricula',
                                                    message	: 'Desea eliminar esta matricula?',
                                                    buttons	: Ext.Msg.YESNO,
                                                    icon	: Ext.Msg.QUESTION,
                                                    fn: function(btn) {
                                                        if (btn === 'yes') {
                                                            me.onMsgWait();
                                                            const grid 	= cbtn.up('#gridMat'),
                                                                records = grid.getSelectionModel().getSelection(),
                                                                store 	= grid.getStore();
                                                            let extra		= me.getParamStore('HistorialStore');
                                                            extra.pdbForce = 0;
                                                            me.setParamStore('HistorialStore',extra);
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
                                        },'-',
                                        {
                                            xtype   : 'deletebutton',
											hidden  : true,
                                            text	: 'Forzar borrado',
                                            itemId	: 'btnDeleteForce',
                                            handler : function (btn) {
                                                var cbtn = btn,
                                                    me	 = Admin.getApplication();
                                                Ext.Msg.show({
                                                    title	: 'Eliminar matricula',
                                                    message	: 'Desea eliminar esta matricula y sus respectivas notas?',
                                                    buttons	: Ext.Msg.YESNO,
                                                    icon	: Ext.Msg.QUESTION,
                                                    fn: function(btn) {
                                                        if (btn === 'yes') {
                                                            me.onMsgWait();
                                                            var grid 	= cbtn.up('#gridMat'),
                                                                records = grid.getSelectionModel().getSelection(),
                                                                store 	= grid.getStore(),
                                                                extra	= {};
                                                                extra	= me.getParamStore('HistorialStore');
                                                            extra.pdbForce = 1;
                                                            me.setParamStore('HistorialStore',extra);
                                                            extra	= {};
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
        }
    ]
});
