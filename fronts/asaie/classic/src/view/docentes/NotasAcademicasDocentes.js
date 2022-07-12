Ext.define('Admin.view.docentes.NotasAcademicasDocentes', {
    extend: 'Ext.form.Panel',
    alias: 'widget.notasacademicasdocentes',
    xtype: 'notasacademicasdocentes',
    initComponent: function() {
		let me  	= this,
			height = Ext.Element.getViewportHeight();
        me.callParent(arguments);
		me.setTitle('Registro de notas - ' + Global.getYear());
		me.setMaxHeight(height - 148);
    },
    cls: 'shadow email-compose',
    controller: 'carga',
    defaultFocus: 'CbCarga',
    bodyPadding: 0,
    layout: 'fit',
    defaults: {
        anchor: '100%'
    },
    items: [

    ],
    dockedItems: [{
            xtype: 'customToolbar',
            itemId: 'carg',
            items: [
                {
                    xtype: 'customComboBox',
                    fieldLabel: '',
                    store: 'CargaStore',
                    valueField: 'grado',
                    itemId: 'CbCarga',
                    reference: 'CbCarga',
                    publishes: 'value',
                    minChars: 2,
                    flex: 1,
                    emptyText: 'Seleccione la asignatura por favor...',
                    tpl: Ext.create('Ext.XTemplate',
                        '<ul class="x-list-plain"><tpl for=".">',
                        '<li role="option" class="x-boundlist-item">{grado} - {grupo} - {asignatura} - {jornada} - {sede}</li>',
                        '</tpl></ul>'
                    ),
                    // template for the content inside text field
                    displayTpl: Ext.create('Ext.XTemplate',
                        '<tpl for=".">',
                        '{grado} - {grupo} - {asignatura} - {jornada} - {sede}',
                        '</tpl>'
                    ),
                    listeners: {
                        focusenter: function(t) {
                            oldValue = t.value;
                            if (oldValue) {
                                t.expand();
                            }

                        },
                        beforeselect: function(c) {
                            var win = c.up('form'),
                                grid = win.down('grid');
                            if (!Ext.isEmpty(grid)) {
                                var store = grid.getStore(),
                                    me = Admin.getApplication(),
                                    modified = store.getModifiedRecords();
                                if (!Ext.isEmpty(modified)) {
                                    me.onAler('Hay cambios pendientes.');
                                    return false;
                                }
                            }
                        },
                        select: function(c, r, e) {
                            var win = c.up('form'),
                                form = win,
                                cont = win.getController(),
                                grid = win.down('grid');
                            cont.onStopTimer(c);
                            if (!Ext.isEmpty(grid)) {
                                form.remove('notasGrid', true);
                            }
                            var
                                cod_grado = r.get('id_grado'),
                                me = Admin.getApplication(),
                                sTitle = r.get('asignatura') + '- ' + r.get('jornada') + '- ' + r.get('grado') + '- Grupo: ' + r.get('grupo') + '- Año: ' + r.get('year');
                            extra = {
                                pdbTable: 'periodos_academicos',
                                pdbGrado: cod_grado,
                                pdbType: 0
                            };
                            me.setParamStore('PeriodosStore', extra);
                            c.up('form').setTitle('Registro de notas: ' + sTitle);
                        }
                    }
                },
                {
                    xtype: 'CbPeriodos',
                    reference: 'periodos',
                    labelAlign: 'left',
                    bind: {
                        disabled: '{!CbCarga.value}'
                    },
                    listeners: {
                        beforeselect: function(c) {
                            var win = c.up('form'),
                                form = win.down('form'),
                                grid = win.down('grid');
                            if (!Ext.isEmpty(grid)) {
                                var store = grid.getStore(),
                                    me = Admin.getApplication(),
                                    modified = store.getModifiedRecords();
                                if (!Ext.isEmpty(modified)) {
                                    me.onAler('Hay cambios pendientes.');
                                    return false;
                                }
                            }
                        },
                        select: function(c, rc) {
                            var win     = c.up('form'),
                                form    = win,
                                cont    = win.getController(),
                                grid    = win.down('grid');
                            win.down('#btnSearch').setDisabled(false);
                            win.down('#btnConfig').setDisabled(true);
                            cont.onStopTimer(c);
                            if (!Ext.isEmpty(grid)) {
                                form.remove('notasGrid', true);
                            }
                        }
                    }
                },
                {
                    xtype: 'customButton',
                    tooltip : 'Búscar notas',
                    itemId: 'btnSearch',
                    iconCls: 'x-fa fa-search',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    handler: function(btn) {
                        var
                            me = Admin.getApplication(),
                            con = btn.up('form').getController(),
                            form = btn.up('form'),
                            grid = form.down('grid'),
                            r = form.down('#CbCarga').getSelection(),
                            rc = form.down('#periodo').getSelection(),
                            extra = {};
                        form.down('#btnSearch').setDisabled(false);
                        form.down('#btnConfig').setDisabled(false);
                        if (!Ext.isEmpty(grid)) {
                            form.remove('notasGrid', true);
                        }
                        extra = {
                            pdbCurso: r.get('id'),
                            pdbGrado: r.get('id_grado'),
                            pdbGrupo: r.get('grupo'),
                            pdbPeriodo: rc.get('periodo'),
                            pdbTable: 'config_columns_theacher'
                        };
                        me.setParamStore('ColumnDocentesStore', extra);
                        con.onSelectionNotas(btn);
                    }
                }, '-',
                {
                    tooltip : 'Observaciones Pre-Informe',
                    iconCls: 'x-fa fa-newspaper-o',
                    itemId: 'btnPreInforme',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    handler: function(btn) {
                        var
                            r = btn.up('form').down('#CbCarga').getSelection(),
                            rc = btn.up('form').down('#periodo').getSelection(),
                            me = Admin.getApplication();
                        extP = {
                            pdbGrado: r.get('id_grado'),
                            pdbGrupo: r.get('grupo'),
                            pdbCurso: r.get('id'),
                            pdbPeriodo: rc.get('periodo'),
                            pdbTable: 'preinforme'
                        };
                        me.setParamStore('PreinformeStore', extP);
                        win = Ext.create('Admin.view.docentes.reportes.Preinforme');
                        win.setTitle('Pre-Informe periódico: ' + r.get('asignatura') + ' - ' + r.get('grado') + ' - ' + r.get('grupo'));
                        win.show();
                    }
                }, '-',
                {
                    tooltip : 'Sugerencias - Observaciones',
                    itemId: 'btnSug',
                    iconCls: 'x-fa fa-commenting',
                    handler: function(btn) {
                        Ext.create('Admin.view.docentes.Sugerencias').show();
                    }
                },
                {
                    tooltip : 'Descriptores',
                    iconCls: 'x-fa fa-star-half-o',
                    itemId: 'btnIndicadores',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    handler: function(btn) {
                        var
                            record = btn.up('form').down('#CbCarga').getSelection(),
                            me = Admin.getApplication();
                        extP = {
                            pdbGrado: record.get('id_grado'),
                            pdbAsig: record.get('id_asig'),
                            pdbGrupo: record.get('grupo'),
                            pdbSede: record.get('id_sede'),
                            pdbJorn: record.get('id_jorn'),
                            pdbType: 0,
                            pdbCurso: 0,
                            pdbTable: 'logros_estandares'
                        };
                        me.setParamStore('LogrosStore', extP);
                        Ext.create('Admin.view.docentes.Descriptores', {
                            record: record,
                            title: 'Descriptores: ' + record.get('asignatura') + ' - ' + record.get('grado')
                        }).show();
                    }
                }, '-',
                {
                    tooltip : 'Sincronizar descriptores con las notas académicas',
                    iconCls: 'x-fa fa-refresh',
                    itemId: 'btnSync',
                    ui: 'soft-purple',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    handler: function(btn) {
                        var
                            me = Admin.getApplication(),
                            cUrl = Global.getUrlBase() + 'c_notas/get_sync_notas',
                            extra = {},
                            record = btn.up('form').down('#CbCarga').getSelection(),
                            p = btn.up('form').down('#periodo').value;
                        extra = {
                            pdbCurso: record.get('id'),
                            pdbGrado: record.get('id_grado'),
                            pdbAsig: record.get('id_asig'),
                            pdbJorn: record.get('id_jorn'),
                            pdbSede: record.get('id_sede'),
                            pdbGrupo: record.get('grupo'),
                            pdbPeriodo: p
                        };
                        Ext.Ajax.request({
                            url: cUrl,
                            params: extra,
                            success: function(response, opts) {
                                me.showResult('Proceso realizado correctamente.')
                            },
                            failure: function(response, opts) {
                                me.onError(response.responseText);
                            }
                        });
                    }
                }, '-',
                {
                    xtype: 'customButton',
                    ui: 'soft-green',
                    iconCls: 'x-fa fa-cloud-download',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    tooltip : 'Exportar plantilla excel',
                    handler: 'onDownloadExcel'
                },
                {
                    xtype: 'customButton',
                    ui: 'soft-green',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    iconCls: 'x-fa fa-cloud-upload',
                    tooltip : 'Importar plantilla excel',
                    handler: 'onLoadExcel'
                }
            ]
        },
        {
            xtype: 'customToolbar',
            defaultType: 'customButton',
            items: [{
                    tooltip : 'Asignar Sugerencias - Observaciones a estudiantes',
                    itemId: 'menuNotes',
                    disabled: true,
                    iconCls: 'x-fa fa-commenting',
                    handler: 'onAddSugerencias'
                },
                {
                    tooltip : 'Asignar Descriptores a estudiantes',
                    iconCls: 'x-fa fa-star-half-o',
                    itemId: 'menuIndicadores',
                    disabled: true,
                    handler: 'onClickLogros'
                }, '-',
                {
                    tooltip : 'Configurar plantilla de notas',
                    itemId: 'btnConfig',
                    disabled: true,
                    iconCls: 'x-fa fa-cogs',
                    handler: 'onViewConfig'
                }, '-',
                {
                    itemId: 'menuConfigSugerencias',
                    iconCls: 'fas fa-comment',
                    tooltip : 'Sugerencias u observaciones asignados a los estudiantes.',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    handler: 'onClickListSugerencias'
                },
                {
                    itemId: 'menuConfigLogros',
                    iconCls: 'x-fa fa-star-half-o',
                    tooltip : 'Descriptores asignados a los estudiantes.',
                    bind: {
                        disabled: '{!periodos.value}'
                    },
                    handler: 'onClickListLogros'
                }, '-',
                {
                    tooltip : 'Agregar desempeños',
                    itemId: 'btnDesempen',
                    iconCls: 'x-fa fa-thumbs-up',
                    disabled: true,
                    handler: 'onClickDesemp'
                }, '-',
                {
                    xtype: 'label',
                    text: 'Auto guradar en 0 SEG.',
                    itemId: 'lbClock'
                }, '-',
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Sexo',
                    defaults: {
                        name: 'sexo'
                    },
                    itemId      : 'sexo',
                    labelWidth  : 30,
                    columns     : 3,
                    vertical    : true,
                    hideLabel   : true,
                    tooltip     : 'Permite filtar el listado por sexo',
                    items: [
                        {
                            boxLabel    : 'Mixto',
                            inputValue  : 'MX',
                            checked     : true,
                            tooltip     : 'Permite mostrar todos de los estudiantes'
                        },
                        {
                            boxLabel    : 'M',
                            inputValue  : 'M',
                            tooltip     : 'Permite mostrar solo la lista de los estudiantes másculinos',
                            margin      : '0 0 0 2'
                        },
                        {
                            boxLabel    : 'F',
                            inputValue  : 'F',
                            margin      : '0 0 0 2',
                            tooltip     : 'Permite mostrar solo la lista de los estudiantes femeninos'
                        }
                    ],
                    listeners: {
                        change: function(btn, newValue, oldValue, eOpts) {

                        }
                    }
                }, '-',
                {
                    tooltip : 'Guardar los cambios',
                    itemId: 'btnSave',
                    iconCls: 'x-fa fa-floppy-o',
                    disabled: true,
                    handler: 'onClickSave'
                }, '-',
                {
                    tooltip : 'Calcular',
                    itemId: 'btnCalcular',
                    iconCls: 'x-fa fa-calculator',
                    disabled: true,
                    ui: 'soft-purple',
                    handler: 'onClickCalcular'
                }, '->',
                '-',
                {
                    xtype: 'facebookButton'
                },
                {
                    xtype: 'youtubeButton'
                },
                '-',
                {
                    tooltip : 'Deshacer, cancelar los cambios',
                    itemId: 'btnUndo',
                    iconCls: 'x-fa fa-undo',
                    disabled: true,
                    ui: 'soft-green',
                    handler: 'onClickUndo'
                }, '-',
                {
                    tooltip : 'Cerrar la ventana',
                    itemId: 'closebutton',
                    iconCls: 'x-fa fa-arrow-circle-left',
                    ui: 'soft-red',
                    handler: 'onClickClose'
                }
            ]
        }
    ]
});
