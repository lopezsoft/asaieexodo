Ext.define('Admin.view.docentes.OnlineActities',{
    extend	    : 'Admin.forms.CustomForm',
    alias 	    : 'widget.onlineactities',
    xtype 	    : 'onlineactities',
    controller  : 'actividades',
    initComponent : function(){
        var me  = Admin.getApplication();
        me.onStore('docentes.OnlineActivitiesStore');
        me.onStore('docentes.CursosAsignadosActStore');
        me.onStore('docentes.CargaStore');
        this.setTitle('Actividades en línea - ' + Global.getYear());
        this.callParent(arguments);
    },
    title           : 'Actividades',
    controller      : 'actividades',  
    modalView       : 'Admin.view.docentes.OnlineActitiesSave',
    showSaveButton  : false,
    items   : [
        {
            cls         : 'allRecordsCls',
            hideHeaders : true,
            border      : false,
            selModel    : 'rowmodel',
            xtype       : 'customgrid',
            store		: 'OnlineActivitiesStore',
            plugins		: [
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype       : 'preview',
                    expanded    : true,
                    bodyField   : 'descripcion'
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
                video: {
                    iconCls: 'fab fa-youtube',
                    tooltip: 'Ver video',
                    handler: 'onVideo'
                },
                courses: {
                    iconCls : 'fas fa-chalkboard-teacher',
                    tooltip : 'Ver cursos asignados',
                    handler : 'viewActivitiesCourses'
                },
                results: {
                    iconCls: 'fas fa-poll',
                    tooltip: 'Ver resultados'
                },
                url: {
                    iconCls: 'x-fa fa-link',
                    tooltip: 'Abrir enlace',
                    handler: 'onUrl'
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
                    items           : ['@video']
                },
                {
                    menuDisabled    : true,
                    sortable        : false,
                    xtype           : 'actioncolumn',
                    width           : 30,
                    items           : ['@url']
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
                    text        : 'Nombre',
                    flex        : 1,
                    dataIndex   : 'nombre'
                },
                {
                    text 		: 'Estado',
                    width 		: 110,
                    dataIndex	: 'estado',
                    filter		: 'list',
                    renderer :  function(val) {
                        switch(val){
                            case 1:
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
                            // xtype           : 'datecolumn',
                            text 		    : 'Fecha',
                            width 		    : 95,
                            dataIndex	    : 'fecha'
                        },
                        {
                            text 		    : 'Hora',
                            width 		    : 90,
                            dataIndex	    : 'hora'
                        }
                    ]
                },
                {
                    text    : 'Disponible hasta',
                    columns : [
                        {
                            // xtype           : 'datecolumn',
                            text 		    : 'Fecha',
                            width 		    : 95,
                            dataIndex	    : 'fecha_cierre'
                        },
                        {
                            text 		    : 'Hora',
                            width 		    : 90,
                            dataIndex	    : 'hora_cierre'
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
                                Ext.create('Admin.view.docentes.AsignarCursoM',{
                                    title   : 'Asignar curso a la actividad: ' + record.get('nombre'),
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
    ]
});
