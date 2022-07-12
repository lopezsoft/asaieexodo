Ext.define('Admin.view.estudiantes.StudentsEvaluations',{
    extend	: 'Admin.forms.CustomForm',
    requires: [
        'Admin.view.docs.VideoView',
        'Admin.store.estudiantes.StudentsEvaluationsStore'
    ],
    alias 	    : 'widget.studentsevaluations',
    controller  : 'estudiantes',
    initComponent : function(){
        let me  = this,
            app = Admin.getApplication();
        app.onStore('estudiantes.StudentsEvaluationsStore');
        me.callParent(arguments);
        me.setTitle('Evaluaciones en línea');
	},
	showSaveButton      : false,
    items   : [
        {
            xtype       : 'customgrid',
            store		: 'StudentsEvaluationsStore',
            selModel	: 'rowmodel',
            plugins		: [
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
            // Reusable actions
            actions: {
                leer: {
                    iconCls: 'x-fa fa-eye',
                    tooltip: 'Responder evaluación',
                    handler: 'replyEvaluation'
                }
            },
            viewConfig: {
                getRowClass: function(record) {
                    return record.get('eread') == 1 ? 'letter-row' : 'no-letter-row';
                }
            },
            columns	: [
                {
                    xtype	: 'customrownumberer'
                },
                {
                    menuDisabled    : true,
                    sortable        : false,
                    xtype       : 'actioncolumn',
                    width       : 30,
                    items       : ['@leer']
                },
                {
                    text        : 'Nombre',
                    width       : 300,
                    dataIndex   : 'nombre'
                },
                {
                    text        : 'Per',
                    width       : 45,
                    dataIndex   : 'periodo'
                },
                {   
                    text    : 'Disponible desde',
                    columns : [
                        {
                            text 		: 'Fecha',
                            width 		: 100,
                            dataIndex	: 'fecha'
                        },
                        {
                            text 		: 'Hora',
                            width 		: 85,
                            dataIndex	: 'hora_apertura'
                        }
                    ]
                },
                {
                    text    : 'Disponible hasta',
                    columns : [
                        {
                            text 		: 'Fecha',
                            width 		: 100,
                            dataIndex	: 'fecha_cierre'
                        },
                        {
                            text 		: 'Hora',
                            width 		: 85,
                            dataIndex	: 'hora_cierre'
                        }
                    ]
                },
                {
                    text 		: 'Grado',
                    width 		: 120,
                    dataIndex	: 'grado'
                },
                {
                    text 		: 'Grupo',
                    width 		: 60,
                    dataIndex	: 'grupo'
                },
                {
                    text 		: 'Jornada',
                    width 		: 100,
                    dataIndex	: 'jornada'
                },
                {
                    text 		: 'Asignatura',
                    width 		: 300,
                    dataIndex	: 'asignatura'
                },
                {
                    text 		: 'Docente',
                    width 		: 300,
                    dataIndex	: 'docente'
                },
                {
                    text 		: 'Sede',
                    width 		: 300,
                    dataIndex	: 'sede'
                }
            ],
            dockedItems: [
                {
                    xtype 		: 'pagination'
                },
                {
                    xtype       : 'customToolbar',
                    items       : [
                        '->',
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-history',
                            text    : 'Historial',
                            itemId  : 'btnHistory',
                            disabled: true,
                            handler : function (btn) {
                                var
                                    app = Admin.getApplication(),
                                    rec = btn.up('grid').getSelection()[0];
                                Ext.require('Admin.view.estudiantes.EvaluacionesHistorialEstudiantesView');
                                Ext.onReady(function () {
                                    param = {
                                        pdbTable    : 'te_evaluaciones_estudiantes',
                                        pdbIdEva    : rec.get('id')
                                    };
                                    app.onStore('estudiantes.EvaluacionesHistorialEstudiantesStore');
                                    app.setParamStore('EvaluacionesHistorialEstudiantesStore',param,false);
                                    win = app.getWindow('Hirtorial: '+rec.get('nombre'),'Admin.view.estudiantes.EvaluacionesHistorialEstudiantesView');
                                    win.show();
                                });
                            }
                        },'-',
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});
