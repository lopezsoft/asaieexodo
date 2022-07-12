Ext.define('Admin.view.estudiantes.StudentsActivities',{
    extend	: 'Admin.forms.CustomForm',
    requires: [
        'Admin.view.docs.VideoView',
        'Admin.store.estudiantes.StudentsActivitiesStore',
        'Admin.grid.CustomGrid'
    ],
    alias 	        : 'widget.studentsactivities',
    controller      : 'estudiantes',
    initComponent   : function(){
        let me  = this,
            app = Admin.getApplication();
        app.onStore('estudiantes.StudentsActivitiesStore');
        app.onStore('estudiantes.CommentsActivitiesStore');
        me.callParent(arguments);
        me.setTitle('Actividades en línea');
    },
    showSaveButton      : false,
    items   : [
        {
            xtype       : 'customgrid',
            store		: 'StudentsActivitiesStore',
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
                leer: {
                    iconCls: 'x-fa fa-eye',
                    tooltip: 'Leer',
                    handler: function (grid, rowIndex) {
                        var rec         = grid.getStore().getAt(rowIndex),
                            img         = rec.get('image') ? rec.get('image') : Global.getAvatarUnknoun(),
                            docente     = rec.get('docente'),
                            asignatura  = rec.get('asignatura'),
                            xhtml       = '';
                        if(!Ext.isEmpty(rec.get('url_archivo'))){
                            xhtml   = '<a href="'+rec.get('url_archivo')+'" target="_blank"> Ver archivo adjunto</a><br>';
                        }
                        if(!Ext.isEmpty(rec.get('url_enlace'))){
                            xhtml   =xhtml +  '<a href="'+rec.get('url_enlace')+'" target="_blank"> Abrir enlace de archivo</a><br>';
                        }
                        if(!Ext.isEmpty(rec.get('url_video'))){
                            xhtml   =xhtml +  '<a href="'+rec.get('url_video')+'" target="_blank"> Abrir enlace de video</a>';
                        }
                        
                        Ext.create('Admin.view.estudiantes.ReadActivity',{
                            maxHeight   : 350,
                            title       : 'Actividades en línea',
                            items   :[
                                {
                                    xtype   : 'form',
                                    ui      : 'panel-white',
                                    items   : [
                                        {
                                            xtype: 'container',
                                            height: 82,
                                            layout: {
                                                type: 'hbox',
                                                align: 'stretch'
                                            },
                                            items: [
                                                {
                                                    xtype   : 'image',
                                                    itemId  : 'userImage',
                                                    cls     : 'email-sender-img',
                                                    src     : img,
                                                    height  : 80,
                                                    width   : 80
                                                },
                                                {
                                                    xtype   : 'component',
                                                    flex    : 1,
                                                    cls     : 'single-mail-email-subject',
                                                    itemId  : 'emailSubjectContainer',
                                                    padding : 10,
                                                    html:
                                                        '<div class="user-name-d">'+docente+'</div>'+
                                                        '<div class="user-info-d">'+asignatura+' - '+rec.get('jornada')+'</div>'+
                                                        '<div class="user-info-d">'+rec.get('grado')+' - '+rec.get('grupo')+'</div>'+
                                                        '<div class="user-info-d">'+rec.get('sede')+'</div>'
                                                }
                                            ]
                                        },
                                        {
                                            xtype   : 'box',
                                            cls     : 'mail-body',
                                            html    :
                                            '<br>'+
                                            '<div class="user-name-d">'+rec.get('nombre')+'</div>'+
                                            '<div class="user-info-d">'+rec.get('descripcion')+'</div>'+ 
                                            xhtml
                                        }
                                    ]
                                }
                            ]
                        }).show();
                        if (!rec.get('leido')) {
                            rec.set('leido',1);
                            grid.getStore().sync({
                                success : function (r, o) {
                                    var
                                        gb      = Global,
                                        socket  = gb.getSocket();
                                    socket.emit('sendActivity',{
                                        cfg : Global.getCfg(),
                                        id  : rec.get('id')
                                    },()=>{});
                                }
                            });
                        }
                    }
                },
                document: {
                    iconCls: 'x-fa fa-paperclip',
                    tooltip: 'Archivo adjunto',
                    handler: 'onDocument'
                },
                video: {
                    iconCls: 'x-fa fa-youtube-play',
                    tooltip: 'Ver video',
                    handler: 'onVideo'
                },
                url: {
                    iconCls: 'x-fa fa-link',
                    tooltip: 'Abrir enlace',
                    handler: 'onUrl'
                },
                comments: {
                    iconCls: 'fas fa-comments',
                    tooltip: 'Comentarios',
                    handler: 'onCommentsActivities'
                }
            },
            viewConfig: {
                getRowClass: function(record) {
                    return record.get('leido') == 1 ? 'letter-row' : 'no-letter-row';
                }
            },
            columns	: [
                {
                    xtype	: 'customrownumberer'
                },
                {
                    text    : 'Acciones',
                    columns : [
                        {
                            menuDisabled    : true,
                            sortable        : false,
                            xtype       : 'actioncolumn',
                            width       : 30,
                            items       : ['@leer']
                        },
                        {
                            menuDisabled    : true,
                            sortable        : false,
                            xtype       : 'actioncolumn',
                            width       : 30,
                            items       : ['@document']
                        },
                        {
                            menuDisabled    : true,
                            sortable        : false,
                            xtype       : 'actioncolumn',
                            width       : 30,
                            items       : ['@video']
                        },
                        {
                            menuDisabled    : true,
                            sortable        : false,
                            xtype       : 'actioncolumn',
                            width       : 30,
                            items       : ['@url']
                        },
                        {
                            menuDisabled    : true,
                            sortable        : false,
                            xtype       : 'actioncolumn',
                            width       : 30,
                            items       : ['@comments']
                        }
                    ]
                },
                {
                    text        : 'Nombre',
                    width       : 300,
                    dataIndex   : 'nombre'
                },
                {
                    text    : 'Disponible desde',
                    columns : [
                        {
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
                }
            ]
        }
    ]
});
