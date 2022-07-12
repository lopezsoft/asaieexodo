Ext.define('Admin.view.estudiantes.StudentsLiveClasses',{
    extend	: 'Admin.forms.CustomForm',
    requires: [
        'Admin.view.docs.VideoView',
        'Admin.store.estudiantes.StudentsLiveClassesStore'
    ],
    alias 	    : 'widget.studentsliveclasses',
    controller  : 'estudiantes',
    initComponent : function(){
        let me  = this,
            app = Admin.getApplication();
        app.onStore('estudiantes.StudentsLiveClassesStore');
        me.callParent(arguments);
        me.setTitle('Clases en vivo - ' + Global.getYear());
	},
	showSaveButton      : false,
    items   : [
        {
            xtype       : 'customgrid',
            store		: 'StudentsLiveClassesStore',
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
                connect: {
                    iconCls: 'fas fa-play',
                    tooltip: 'Conectarse a la clase',
                    handler: 'onConnectToLiveClass'
                }
            },
            viewConfig: {
                getRowClass: function(record) {
                    return record.get('isit_read') == 1 ? 'letter-row' : 'no-letter-row';
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
                    items       : ['@connect']
				},
				{
                    text 		: 'Estado',
                    width 		: 130,
                    dataIndex	: 'active_class',
                    filter		: 'list',
                    renderer :  function(val) {
                        switch(val){
                            case '1':
                                return '<span style="color:green;"> <b> Disponible </b></span>';
                                break;
                            default :
                                return '<span style="color:red;"> <b> No Disponible </b></span>';
                                break;
                        }
                    }
				},
                {   
                    text    : 'Disponible desde',
                    columns : [
                        {
                            text 		: 'Fecha',
                            width 		: 100,
                            dataIndex	: 'closing_date'
                        },
                        {
                            text 		: 'Hora',
                            width 		: 100,
                            dataIndex	: 'closing_time'
                        }
                    ]
				},
				{
                    text 		: 'Tiempo',
                    width 		: 100,
                    dataIndex	: 'class_time',
                    filter		: 'list',
                    menuDisabled: true,
                    renderer :  function(val) {
                        return '<span style="color:#000;"> <b> '+val.toString()+' min</b></span>';
                    }
				},
				{
                    text    : 'Transmisión',
                    columns : [
                        {
                            text 		    : 'Iniciada?',
                            width 		    : 90,
							dataIndex	    : 'transmiting_class',
							renderer :  function(val) {
								switch(val){
									case '1':
										return '<span style="color:green;"> <b> SI </b></span>';
										break;
									default :
										return '<span style="color:red;"> <b> NO </b></span>';
										break;
								}
							}
                        },
                        {
                            text 		    : 'Inició',
                            width 		    : 155,
                            dataIndex	    : 'transmission_start_time_class'
                        },
                        {
                            text 		    : 'Finalizó',
                            width 		    : 155,
                            dataIndex	    : 'transmission_closing_time_class'
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
