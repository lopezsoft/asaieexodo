Ext.define('Admin.view.docentes.EvaluationQuestions',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.evaluationquestions',
    controller  : 'actividades',
    modalView   : 'Admin.view.docentes.EvaluationQuestionSave',
    items   : [
        {
            xtype   : 'custompanel',
            margin  : 0,
            layout: {
                type    : 'hbox',
                align   : 'stretch'
            },
            items   : [
                {
                    xtype               : 'customgrid',
                    collapseMode        : 'undefined',
                    split               : true,
                    title               : 'PREGUNTAS',
                    plugins		: [
                        {
                            ptype: 'rowexpander',
                            rowBodyTpl : new Ext.XTemplate(
                                '<p><b>Descripción:</b></p> {descripcion}<br>',
                                '<p><b>Pregunta:</b></p>{pregunta}'
                            )
                        },
                        {
                            ptype : 'gridfilters'
                        },
                        {
                            ptype       : 'cellediting',
                            clicksToEdit: 1
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
                    store       : 'EvaluationQuestionsStore',
                    flex        : 3,
                    listeners   : {
                        'selectionchange': function(grid, selected) {
                            var
                                me 		= Admin.getApplication();
                            if (selected[0]) {
                                xparam = {
                                    where       : '{"question_id":' + selected[0].get('id') + '}',
                                    pdbTable    : 'te_evaluation_answers'
                                };
                                me.setParamStore('EvaluationAnswersStore', xparam, true);
                            }
                        }
                    },
                    columns     : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            text        : 'Pregunta',
                            dataIndex   : 'pregunta',
                            width       : 300,
                            // editor      : {
                            //     xtype       : 'textfield',
                            //     allowBlank  : false
                            // },
                            filter      : 'string'
                        },
                        {
                            text        : 'Pts %',
                            dataIndex   : 'valor',
                            width       : 80
                        },
                        {
                            text        : 'Tipo',
                            dataIndex   : 'type_id',
                            width       : 300,
                            filter      : 'string',
                            renderer :  function(val) {
                                switch(parseInt(val)){
                                    case 1:
                                        return '<span style="color:red;"> <b> General o abierta </b></span>';
                                        break;
                                    case 2:
                                        return '<span style="color:blue;"> <b> Selección múltiple con única respuesta </b></span>';
                                        break;
                                    case 3:
                                        return '<span style="color:green;"> <b> Selección múltiple con múltiple respuesta </b></span>';
                                        break;
                                    default :
                                        return '<span style="color:#b4ac2f;"> <b> FALSO/VERDADERO </b></span>';
                                        break;
                                }
                            }
                        }
                    ],
                    dockedItems : [
                        {
                            xtype   : 'toolbarCrud',
                            items   : [
                                '->',
                                // {
                                //     xtype   : 'saveButton',
                                //     handler : function (btn) {
                                //         store   = Ext.getStore('EvaluationQuestionsStore');
                                //         store.sync();
                                //     }
                                // },
                                {   
                                    xtype   : 'editButton'
                                },
                                {
                                    xtype   : 'deletebutton'
                                },'-',
                                {
                                    xtype   : 'closebutton'
                                }
                            ]
                        },
                        {
                            xtype 		: 'pagination'
                        }
                    ]
                },
                {
                    xtype       : 'customgrid',
                    store       : 'EvaluationAnswersStore',
                    title       : 'RESPUESTAS',
                    itemId      : 'gridResp',
                    plugins		: [
                        {
                            ptype: 'cellediting',
                            clicksToEdit: 1
                        },
                        {
                            ptype : 'gridfilters'
                        },
                        {
                            ptype : 'responsive'
                        }
                    ],
                    autoLoad            : false,
                    flex                : 2,
                    collapseFirst       : true,
                    collapseDirection   : 'right',
                    collapseMode        : 'undefined',
                    collapsible         : true,
                    columns     : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            text        : 'Respuesta',
                            dataIndex   : 'respuesta',
                            width       : 300,
                            filter      : 'string',
                            editor: {
                                xtype: 'textfield',
                                allowBlank: false
                            }
                        },
                        {
                            text        : 'Puntos',
                            dataIndex   : 'valor',
                            width       : 70
                        },
                        {
                            xtype       : 'checkcolumn',
                            text        : 'Correcta',
                            disabled    : true,
                            dataIndex   : 'verdadera',
                            width       : 75
                        },
                        {
                            xtype       : 'checkcolumn',
                            disabled    : true,
                            text        : 'Activa',
                            dataIndex   : 'estado',
                            width       : 70
                        }
                    ],
                    dockedItems : [
                        {
                            xtype   : 'customToolbar',
                            items   : [
                                {
                                    xtype   : 'saveButton',
                                    handler : function (btn) {
                                        store   = Ext.getStore('EvaluationAnswersStore');
                                        store.sync();
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
    }]
});
