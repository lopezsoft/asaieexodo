Ext.define('Admin.view.docentes.EvaluationResult',{
    extend	    : 'Admin.forms.CustomForm',
    alias 	    : 'widget.evaluationresult',
    xtype 	    : 'evaluationresult',
    controller  : 'actividades',
    config          :  {
        evaluationId    : 0,
        courseId        : 0,
        evaluationName  : '',
        record          : null
    },
    initComponent : function() {
        let me      = this;
        if(!me.getEvaluationId() > 0){
            me.getController().redirectTo('evaluaciones', true);
        }else{
            let zstore  = Ext.create('Admin.store.base.StoreApi',{
                model		: 'Admin.model.docentes.CargaModel',
                proxy: {
                    type	: 'ajax',
                    api: {
                        create  : '#master/insertData',
                        read    : 'evaluations/getEvaluationResult',
                        update  : 'master/updateData',
                        destroy : 'master/deleteData'
                    },
                    extraParams : {
                        id      : me.getEvaluationId(),
                        courseId: me.getCourseId(),
                        pdbTable: 'te_evaluation_result',
                        type    : 2
                    }
                },
                autoLoad: true
            });

            me.items    = [
                {
                    xtype       : 'customgrid',
                    store		: zstore,
                    selModel    : 'rowmodel',
                    plugins		: [
                        {
                            ptype : 'gridfilters'
                        },
                        {
                            ptype       : 'preview',
                            expanded    : true,
                            bodyField   : 'estudiante'
                        },
                        {
                            ptype			: 'gridSearch',
                            readonlyIndexes	: ['note'],
                            disableIndexes	: ['pctChange'],
                            minChars		: 1,
                            mode            : 'local',
                            flex			: 1,
                            autoFocus		: true,
                            independent		: true
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
                    columns	: [
                        {
                            xtype	: 'rownumberer'
                        },
                        {
                            width       : 60,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex   : 'punataje',
                            text        : 'Nota'
                        },
                        {
                            text        : 'Per',
                            width       : 45,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex   : 'periodo'
                        },
                        {
                            text    : 'Respestas',
                            columns : [
                                {
                                    text        : 'Correctas',
                                    width       : 85,
                                    menuDisabled: true,
                                    sortable    : false,
                                    dataIndex   : 'res_verdaderas'
                                },
                                {
                                    text        : 'Falsas',
                                    width       : 60,
                                    menuDisabled: true,
                                    sortable    : false,
                                    dataIndex   : 'res_falsas'
                                },
                                {
                                    text        : 'Abiertas',
                                    width       : 80,
                                    menuDisabled: true,
                                    sortable    : false,
                                    dataIndex   : 'res_abiertas'
                                }
                            ]
                        },
                        {
                            text        : 'Intento',
                            width       : 65,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex   : 'intento'
                        },
                        {   
                            text    : 'Fecha',
                            columns : [
                                {
                                    xtype       : 'datecolumn',
                                    text 		: 'Hora inicio',
                                    width 		: 150,
                                    menuDisabled: true,
                                    sortable    : false,
                                    dataIndex	: 'hora_inicio'
                                },
                                {
                                    text 		: 'Hora finalzación',
                                    width 		: 150,
                                    menuDisabled: true,
                                    sortable    : false,
                                    dataIndex	: 'hora_final'
                                }
                            ]
                        },
                        {
                            text 		: 'Grado',
                            width 		: 120,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex	: 'grado'
                        },
                        {
                            text 		: 'Grupo',
                            width 		: 60,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex	: 'grupo'
                        },
                        {
                            text 		: 'Jornada',
                            width 		: 100,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex	: 'jornada'
                        },
                        {
                            text 		: 'Asignatura',
                            width 		: 300,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex	: 'asignatura'
                        },
                        {
                            text 		: 'Sede',
                            width 		: 300,
                            menuDisabled: true,
                            sortable    : false,
                            dataIndex	: 'sede'
                        }
                    ],
                    dockedItems : [
                        {
                            xtype   : 'pagination'
                        },
                        {
                            xtype   : 'toolbarcrud',
                            items 	: [
                                '->'
                                ,'-',
                                {
                                    xtype	: 'deletebutton'
                                },'-',
                                {
                                    xtype 	: 'closebutton'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        me.callParent(arguments);
        me.setTitle('Resultados: ' + me.getEvaluationName());
    },
    showSaveButton  : false
});
