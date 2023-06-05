Ext.define('Admin.view.docentes.Evaluaciones', {
    extend: 'Admin.forms.CustomForm',
    alias: 'widget.evaluaciones',
    xtype: 'evaluaciones',
    controller: 'actividades',
    initComponent: function() {
        let app = Admin.getApplication();
        app.onStore('docentes.EvaluacionesStore');
        app.onStore('general.PeriodosStore');
        app.onStore('docentes.EvaluationQuestionsStore');
        app.onStore('docentes.EvaluationAnswersStore');
        extra = {
            pdbTable: 'periodos_academicos',
            pdbGrado: 5,
            pdbType: 0
        };
        app.setParamStore('PeriodosStore', extra);
        this.setTitle('Evaluaciones - ' + Global.getYear());
        this.callParent(arguments);
    },
    showSaveButton: false,
    modalView: 'Admin.view.docentes.EvaluacionesSave',
    items: [{
        xtype: 'customgrid',
        store: 'EvaluacionesStore',
        selModel: 'rowmodel',
        plugins: [{
                ptype: 'gridfilters'
            },
            {
                ptype: 'preview',
                expanded: true,
                bodyField: 'descripcion'
            },
            {
                ptype: 'gridSearch',
                readonlyIndexes: ['note'],
                disableIndexes: ['pctChange'],
                minChars: 1,
                mode: 'local',
                flex: 1,
                autoFocus: true,
                independent: true
            }
        ],
        viewModel: {
            data: {
                expanded: true
            }
        },
        viewConfig: {
            trackOver: false,
            stripeRows: false
        },
        actions: {
            publicar: {
                iconCls: 'x-fa fa-share',
                tooltip: 'Publicar evaluación',
                handler: 'onPublicarView'
            },
            viewEval: {
                iconCls: 'x-fa fa-eye',
                tooltip: 'Visata previa',
                handler: 'onViewEval'
            },
            viewCourses: {
                iconCls: 'fas fa-chalkboard-teacher',
                tooltip: 'Ver cursos asignados',
                handler: 'viewCourses'
            }
        },
        columns: [{
                xtype: 'rownumberer'
            },
            {
                text: 'Acciones',
                columns: [{
                        xtype: 'actioncolumn',
                        menuDisabled: true,
                        sortable: false,
                        width: 30,
                        items: ['@publicar']
                    },
                    {
                        xtype: 'actioncolumn',
                        menuDisabled: true,
                        sortable: false,
                        width: 30,
                        items: ['@viewEval']
                    },
                    {
                        xtype: 'actioncolumn',
                        menuDisabled: true,
                        sortable: false,
                        width: 30,
                        items: ['@viewCourses']
                    }
                ]
            },
            {
                flex: 1,
                dataIndex: 'nombre',
                text: 'Nombre'
            },
            {
                text: 'P',
                width: 40,
                menuDisabled: true,
                dataIndex: 'periodo'
            },
            {
                text: 'Preguntas',
                width: 100,
                dataIndex: 'num_preguntas'
            },
            {
                text: 'Esquema',
                width: 100,
                dataIndex: 'esquema',
                filter: 'list',
                renderer: function(val) {
                    switch (val) {
                        case 1:
                            return '<span style="color:red;"> <b> Inserción</b></span>';
                            break;
                        case 2:
                            return '<span style="color:green;"> <b> Aleatorio</b></span>';
                            break;
                        default:
                            return '<span style="color:#b4ac2f;"> <b>' + val + '</b></span>';
                            break;
                    }
                }
            },
            {
                text: 'Tiempo',
                width: 80,
                dataIndex: 'tiempo',
                filter: 'list',
                menuDisabled: true,
                renderer: function(val) {
                    return '<span style="color:#000;"> <b> ' + val.toString() + ' min</b></span>';
                }
            },
            {
                text: 'Disponible desde',
                columns: [{
                        // xtype       : 'datecolumn',
                        text: 'Fecha',
                        width: 100,
                        dataIndex: 'fecha'
                    },
                    {
                        text: 'Hora',
                        width: 85,
                        dataIndex: 'hora_apertura'
                    }
                ]
            },
            {
                text: 'Disponible hasta',
                columns: [{
                        // xtype       : 'datecolumn',
                        text: 'Fecha',
                        width: 100,
                        dataIndex: 'fecha_cierre'
                    },
                    {
                        text: 'Hora',
                        width: 85,
                        dataIndex: 'hora_cierre'
                    }
                ]
            },
            {
                xtype: 'checkcolumn',
                text: 'Activa',
                width: 60,
                dataIndex: 'estado',
                listeners: {
                    checkchange: function(g) {
                        g.up('grid').getStore().sync();
                    }
                }
            },
            {
                xtype: 'checkcolumn',
                text: 'Publicada',
                disabled: true,
                width: 80,
                dataIndex: 'publicada'
            }
        ],
        listeners: {
            'selectionchange': function(gr, selected) {
                this.up('form').onCkeck(selected[0]);
            }
        },
        dockedItems: [{
                xtype: 'pagination'
            },
            {
                xtype: 'toolbarcrud',
                items: [
                    '->',
                    {
                        xtype: 'addbutton'
                    }, '-',
                    {
                        xtype: 'editbutton'
                    }, '-',
                    {
                        xtype: 'deletebutton'
                    }, '-',
                    {
                        xtype: 'custombutton',
                        iconCls: 'far fa-question-circle',
                        text: 'Agregar',
                        tooltip: 'Agregar preguntas a la evaluación',
                        itemId: 'btnAddQuestion',
                        ui: 'header-blue',
                        disabled: true,
                        handler: 'onCreatePreguntas'
                    }, '-',
                    {
                        xtype: 'custombutton',
                        iconCls: 'far fa-question-circle',
                        tooltip: 'Ver preguntas de la evalucación',
                        text: 'Ver',
                        ui: 'header-purple',
                        itemId: 'btnViewQuestion',
                        handler: 'onViewRespuestas',
                        disabled: true
                    }, '-',
                    {
                        xtype: 'badgebutton',
                        badgeText: '0',
                        iconAlign: 'left',
                        iconCls: 'x-fa fa-question',
                        tooltip: 'Número de preguntas faltantes',
                        ui: 'header-red'
                    }, '-',
                    {
                        xtype: 'custombutton',
                        itemId: 'customButton',
                        iconCls: 'fas fa-book-reader',
                        text: 'Asignar cursos',
                        disabled: true,
                        ui: 'header',
                        handler: function(btn) {
                            var record = btn.up('form').down('grid').getSelection()[0];
                            Ext.create('Admin.view.docentes.AsignarCursoE', {
                                title: 'Asignar curso a la Evaluación: ' + record.get('nombre'),
                                record: record
                            }).show();
                        }
                    }, '-',
                    {
                        xtype: 'closebutton'
                    }
                ]
            }
        ]
    }],
    listeners: {
        activate: function() {
            this.onCkeck(this.down('grid').getSelection()[0]);
        }
    },
    onCkeck: function(d) {
        let
            parent = this,
            r = d,
            cls = '',
            data = {};
        if (r) {
            data = {
                fields: 'count(*) total',
                dataName: Global.getDbName(),
                table: 'te_evaluation_questions',
                where: 'evaluation_id = ? ',
                values: [r.get('id')]
            };
            socket = Global.getSocket();
            socket.emit('querySelect', data, function(err, data) {
                if (err) {
                    Admin.getApplication().onError(err.sqlMessage);
                    return
                };
                if (data.length > 0) {
                    val = r.get('num_preguntas') - data[0].total;
                    if (data[0].total < r.get('num_preguntas')) {
                        cls = 'x-btn-badgeCls';
                    } else {
                        cls = 'x-btn-badgeCls-green';
                    }
                    parent.down('#btnAddQuestion').setDisabled(val > 0 ? false : true);
                    bg = parent.down('badgebutton');
                    bg.setBadgeText(val.toString());
                    bg.setBadgeCls(cls);
                }
                socket.close();
            });
        }
    }
});