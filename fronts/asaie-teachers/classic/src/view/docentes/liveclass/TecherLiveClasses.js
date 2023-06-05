Ext.define('Admin.view.docentes.TecherLiveClasses',{
    extend	    : 'Admin.forms.CustomForm',
    alias 	    : 'widget.teacherliveclasses',
    xtype 	    : 'teacherliveclasses',
    initComponent : function(){
        var me  = Admin.getApplication();
        me.onStore('docentes.LiveClassesStore');
        me.onStore('docentes.CoursesLiveClassesStore');
        me.onStore('docentes.CargaStore');
        this.setTitle('Clases en vivo - ' + Global.getYear());
        this.callParent(arguments);
    },
    controller      : 'teacherliveclasses',  
    modalView       : 'Admin.view.docentes.TecherLiveClassesSave',
    showSaveButton  : false,
    items   : [
        {
            cls         : 'allRecordsCls',
            hideHeaders : false,
            border      : false,
            selModel    : 'rowmodel',
            xtype       : 'customgrid',
            store		: 'LiveClassesStore',
            plugins		: [
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype       : 'preview',
                    expanded    : true,
                    bodyField   : 'class_description'
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
            // Reusable actions
            actions: {
                document: {
                    iconCls: 'x-fa fa-paperclip',
                    tooltip: 'Archivo adjunto',
                    handler: 'onDocument'
                },
                courses: {
                    iconCls : 'fas fa-chalkboard-teacher',
                    tooltip : 'Ver cursos asignados',
                    handler : 'viewCoursesLiveClasses'
                },
                results: {
                    iconCls: 'fas fa-poll',
                    tooltip: 'Ver resultados'
                },
                url: {
                    iconCls: 'x-fa fa-link',
                    tooltip: 'Abrir enlace',
                    handler: 'onUrl'
				},
				viewEval: {
                    iconCls : 'x-fa fa-eye',
                    tooltip : 'Visata previa',
                    handler : 'onClassPreview'
                },
				transEval: {
                    iconCls : 'fas fa-video',
                    tooltip : 'Iniciar transmisión',
                    handler : 'onClassTransmitting'
                }
            },
            columns	: [
                {
                    xtype	: 'rownumberer'
                },
                {
                    menuDisabled    : true,
                    sortable        : false,
                    xtype           : 'actioncolumn',
                    width           : 30,
                    items           : ['@document']
                },
                {
                    menuDisabled    : true,
                    sortable        : false,
                    xtype           : 'actioncolumn',
                    width           : 30,
                    items           : ['@results']
                },
                {
                    menuDisabled    : true,
                    sortable        : false,
                    xtype           : 'actioncolumn',
                    width           : 30,
                    items           : ['@courses']
                },
                {
                    menuDisabled    : true,
                    sortable        : false,
                    xtype           : 'actioncolumn',
                    width           : 30,
                    items           : ['@viewEval']
                },
                {
                    menuDisabled    : true,
                    sortable        : false,
                    xtype           : 'actioncolumn',
                    width           : 30,
                    items           : ['@transEval']
                },
                // {
                //     text        : 'Nombre de la sala',
                //     width       : 180,
                //     dataIndex   : 'class_name'
                // },
                {
                    text    : 'Disponible desde',
                    columns : [
                        {
                            text 		    : 'Fecha',
                            width 		    : 95,
                            dataIndex	    : 'closing_date'
                        },
                        {
                            text 		    : 'Hora',
                            width 		    : 90,
                            dataIndex	    : 'closing_time'
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
                    text 		: 'Estado',
                    width 		: 130,
                    dataIndex	: 'active',
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
                    text    : 'Transmisión',
                    columns : [
                        {
                            text 		    : 'Inició',
                            width 		    : 155,
                            dataIndex	    : 'transmission_start_time'
                        },
                        {
                            text 		    : 'Finalizó',
                            width 		    : 155,
                            dataIndex	    : 'transmission_closing_time'
                        }
                    ]
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype   : 'toolbarCrud',
                    items 	: [
                        '->',
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
                            xtype	: 'custombutton',
                            itemId	: 'customButton',
                            iconCls : 'fas fa-book-reader',
                            text    : 'Asignar cursos',
                            disabled: true,
                            ui      : 'header',
                            handler : function(btn){
                                var record  = btn.up('form').down('grid').getSelection()[0];
                                Ext.create('Admin.view.docentes.AddCourseLiveClass',{
                                    title   : 'Asignar curso a la clase: ' + record.get('class_name'),
                                    record  : record
                                }).show();
                            }
                        },'-',
                        {
                            xtype 	: 'closebutton'
                        }
                    ]
                }
            ]
        }
	],
	beforeEdit : function (){
		let me      = this,
			record 	= me.down('grid').getSelection()[0],
			app		= Admin.getApplication();
		if(!(record.get('transmitting') == 0)){
			app.showResult('No se puede editar una clase trasmitida.');
		}
		return (record.get('transmitting') == 0) ? true : false;
	}
});
