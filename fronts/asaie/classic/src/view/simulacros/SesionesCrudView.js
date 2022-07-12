/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.view.simulacros.SesionesCrudView',{
    extend	: 'Admin.base.WindowCrud',
    requires: [
        'Admin.store.simulacros.SesionesStore',
        'Admin.store.simulacros.AreasSimStore',
        'Admin.combo.CbPeriodos',
        'Admin.button.BadgeButton'
    ],
    title	: 'Material educativo',
    alias 	: 'widget.SesionesCrudView',
    controller  : 'Simulacros',
    maximized   : true,
    items   : [
        {
            xtype       : 'customgrid',
            store		: 'SesionesStore',
            iconCls     : '',
            plugins		: [
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype       : 'preview',
                    expanded    : true,
                    bodyField   : 'descripcion'
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
                    tooltip: 'Visata previa de la evaluación',
                    handler: 'onViewEval'
                },
                ResultsEval: {
                    iconCls: 'x-fa fa-eye',
                    tooltip: 'Ver resultados',
                    handler: ''
                },
                viewEvalEst: {
                    iconCls: 'x-fa fa-eye',
                    tooltip: 'Ver lista de estudiantes',
                    handler: ''
                }
            },
            columns	: [
                {
                    xtype	: 'customrownumberer'
                },
                {
                    xtype       : 'actioncolumn',
                    menuDisabled: true,
                    sortable    : false,
                    width       : 30,
                    items       : ['@publicar']
                },
                {
                    xtype       : 'actioncolumn',
                    menuDisabled: true,
                    sortable    : false,
                    width       : 30,
                    items       : ['@viewEval']
                },
                {
                    xtype       : 'actioncolumn',
                    menuDisabled: true,
                    sortable    : false,
                    width       : 30,
                    items       : ['@ResultsEval']
                },
                {
                    xtype       : 'actioncolumn',
                    menuDisabled: true,
                    sortable    : false,
                    width       : 30,
                    items       : ['@viewEvalEst']
                },
                {
                    width           : 300,
                    dataIndex       : 'nombre',
                    text            : 'Nombre'
                },
                {
                    text        : 'Periodo',
                    width       : 70,
                    dataIndex   : 'periodo'
                },
                {
                    text        : 'Preguntas',
                    width       : 100,
                    dataIndex   : 'num_preguntas'
                },
                {
                    text 		: 'Esquema',
                    width 		: 100,
                    dataIndex	: 'esquema',
                    filter		: 'list',
                    renderer :  function(val) {
                        switch(val){
                            case 1:
                                return '<span style="color:red;"> <b> Inserción</b></span>';
                                break;
                            case 2:
                                return '<span style="color:green;"> <b> Aleatorio</b></span>';
                                break;
                            default :
                                return '<span style="color:#b4ac2f;"> <b>' + val + '</b></span>';
                                break;
                        }
                    }
                },
                {
                    text 		: 'Intentos',
                    width 		: 120,
                    dataIndex	: 'intentos',
                    filter		: 'list'
                },
                {
                    text 		: 'Tiempo',
                    width 		: 105,
                    dataIndex	: 'tiempo',
                    filter		: 'list',
                    renderer :  function(val) {
                        return '<span style="color:#000;"> <b> '+val.toString()+' minutos</b></span>';
                    }
                },
                {
                    text 		: 'Páginas',
                    width 		: 70,
                    dataIndex	: 'paginas',
                    filter		: 'list'
                },
                {
                    text 		: 'Fecha apertura',
                    width 		: 120,
                    dataIndex	: 'fecha'
                },
                {
                    text 		: 'Hora apertura',
                    width 		: 120,
                    dataIndex	: 'hora_apertura'
                },
                {
                    text 		: 'Fecha cierre',
                    width 		: 120,
                    dataIndex	: 'fecha_cierre'
                },
                {
                    text 		: 'Hora cierre',
                    width 		: 120,
                    dataIndex	: 'hora_cierre'
                },
                {
                    xtype       : 'checkcolumn',
                    text 		: 'Activa',
                    width 		: 60,
                    dataIndex	: 'estado',
                    listeners   : {
                        checkchange : function (g) {
                            g.up('grid').getStore().sync();
                        }
                    }
                },
                {
                    xtype       : 'booleancolumn',
                    text 		: 'Auto calificar',
                    width 		: 100,
                    dataIndex	: 'auto_calificar',
                    trueText    : 'Si',
                    falseText   : 'No'
                },
                {
                    xtype       : 'checkcolumn',
                    text 		: 'Publicada',
                    disabled    : true,
                    width 		: 80,
                    dataIndex	: 'publicada'
                }
            ],
            listeners   : {
                'selectionchange' : function (grid, selected, eOpts) {
                    var
                        parent  = this,
                        r   = selected[0],
                        cls = '';
                    if(selected.length > 0){
                        var data    = {
                                id  : r.get('id')
                            },
                            gb      = globales.General,
                            cfg     = gb.cfg();
                        socket      = gb.getSocket();
                        socket.emit('total-preguntas-evaluacion',data,cfg);
                        socket.on('receiveTotalPreguntasEvaluacion',function (data,cfgr) {
                            if(data.length > 0){
                                if (gb.compareObjects(gb.cfg(),cfgr)){
                                    val = r.get('num_preguntas') - data[0].total;
                                    if(data[0].total < r.get('num_preguntas')){
                                        cls     = 'x-btn-badgeCls';
                                    }else {
                                        cls     = 'x-btn-badgeCls-green';
                                    }
                                    parent.down('#btnAddQuestion').setDisabled(val > 0 ? false : true);
                                    bg  = parent.down('badgebutton');
                                    bg.setBadgeText(val.toString());
                                    bg.setBadgeCls(cls);
                                }
                            }
                        });

                    }
                }
            },
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype   : 'toolbarCrud',
                    items 	: [
                        {
                            xtype	: 'addButton'
                        },'-',
                        {
                            xtype	: 'editButton'
                        },'-',
                        {
                            xtype	: 'deletebutton'
                        },'-',
                        {
                            xtype	: 'customButton',
                            iconCls : 'x-fa fa-plus',
                            text    : 'Agregar preguntas',
                            itemId  : 'btnAddQuestion',
                            disabled    : true,
                            handler     : 'onCreatePreguntas'
                        },'-',
                        {
                            xtype	: 'customButton',
                            iconCls : 'x-fa fa-eye',
                            text    : 'Ver preguntas',
                            ui		: 'soft-purple',
                            itemId  : 'btnViewQuestion',
                            handler : 'onViewRespuestas',
                            disabled    : true
                        },'-','->',
                        {
                            xtype       : 'badgebutton',
                            badgeText   : '0',
                            iconAlign   : 'left',
                            iconCls     : 'x-fa fa-question',
                            tooltip     : 'Número de preguntas faltantes',
                            ui          : 'header-red'
                        },'-',
                        {
                            xtype 	: 'closebutton'
                        },'-',
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        }
                    ]
                }
            ]
        }
    ]
});
