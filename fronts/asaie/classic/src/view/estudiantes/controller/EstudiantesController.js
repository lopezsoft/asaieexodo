Ext.define('Admin.view.estudiantes.controller.EstudiantesController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.estudiantes',
    init: function() {
        me  = this;
        me.setConfigVar();
	},

	onLibroFinal : function (btn) {
        this.redirectTo('informefinal', true);
	},
	
	onConnectToLiveClass: function (grid, rowIndex) {
		let
			record  = grid.getStore().getAt(rowIndex),
			app		= Admin.getApplication();
		if((record.get('active_class') == 0)){
			app.showResult('La clase no se encuentra activa.','error');
			return false;
		}
		if((record.get('transmiting_class') == 0)){
			app.showResult('No se ha iniciado la transmisión de la clase.','error');
			return false;
		}
		Ext.create('Admin.view.docs.LiveBroadcast',{
			subject			: record.get('class_description'),
			weather			: record.get('class_time'),
			email			: Global.getUserData().email,
			displayName		: Global.getUserData().names + ' ' + Global.getUserData().last_name,
			attached		: record.get('url_file'),
			test			: false,
			store			: 'StudentsLiveClassesStore',
			roomName		: record.get('class_name'),
			isHost			: false,
			isStudent		: true,
			record			: record
		}).show();
	},

	onLiveClasses (){
        this.redirectTo('studentsliveclasses',true);
    },
    onStudentsEvaluations (){
        this.redirectTo('studentsevaluations',true);
    },
    onStudentsActivities (){
        this.redirectTo('studentsactivities',true);
    },
    responseEvaluation : function(record, btn, hora, intentos){
        let
            sql         = '',
            app         = Admin.getApplication(),
            tbarItems   = [],
            newItems    = [],
            ncount      = 0;
        sql = "SELECT * FROM te_evaluation_questions a WHERE a.evaluation_id = "+ record.get('evaluation_id') +" ORDER BY RAND()";
        socket  = gb.getSocket();
        socket.emit('sqlQuery',{
            dataName    : Global.getDbName(),
            sql         : sql
        },(err, res)=>{
            if(err){
                app.showResult('Se produjo un error, no se puede continuar.','error');
                return;
            }
            if(!res.length > 0){
                app.showResult('La evaluación no tiene preguntas, no se puede continuar.','error');
                return;
            }
            tbarItems.push({
                step        : 0,
                iconCls     : 'fa fa-home',
                formId      : null,
                enableToggle: true,
                pressed     : true,
                text        : 'Home'
            });
            newItems.push({
                xtype   : 'panel',
                ui      : 'panel-white',
                items   : [{
                    xtype   : 'container',    
                    cls     : 'widget-bottom-first-container postion-class',
                    layout: {
                        type    : 'vbox',
                        align   : 'center'
                    },
                    items: [
                        {
                            xtype   : 'label',
                            cls     : 'widget-name-text',
                            html    : '<br>' +  record.get('nombre') + '<br>'
                        },
                        {
                            xtype   : 'label',
                            cls     : 'widget-name-text',
                            html    : '<br>' + record.get('asignatura') + '<br>'
                        },
                        {
                            xtype   : 'label',
                            cls     : 'widget-name-text',
                            html    : '<br>' + record.get('docente') + '<br>'
                        }
                    ]
                },{
                    xtype   : 'label',
                    cls     : 'widget-name-text space-left-10',
                    html    : '<br>' + record.get('descripcion') + '<br>'
                }]
            });
            res.forEach(ele => {
                ncount++;
                tbarItems.push({
                    step        : ncount,
                    enableToggle: true,
                    formId      : 'questionId' + ele.id,
                    text        : ncount + '/' + res.length
                });

                newItems.push({
                    xtype               : 'form',
                    scrollable          : true,		
                    layout			    : 'anchor',
                    ui                  : 'panel-white',
                    itemId              : 'questionId' + ele.id,
                    defaultType         : 'textfield',
                    defaults: {
                        labelWidth      : 90,
                        labelAlign      : 'top',
                        labelSeparator  : '',
                        submitEmptyText : false,
                        anchor          : '100%'
                    },
                    items:[
                        {
                            xtype   : 'label',
                            html    : '<br>'+ ncount +' de ' + res.length,
                            cls     : 'widget-name-text'
                        },
                        {
                            xtype   : 'label',
                            cls     : 'widget-name-text space-left-10',
                            html    : '<br>' +  ele.pregunta
                        },
                        {
                            xtype       : 'fieldcontainerquestions',
                            record      : ele,
                            questionId  : ele.id
                        }                
                    ]
                });
            });
            btn.up('window').close();
            Ext.create('Admin.view.docs.ResponseEvaluation',{
                record          : record,
                questions       : res.length,
                hora            : hora,
                intentos        : parseInt(intentos) + 1,
                questionRecords : res,
                // maxHeight       : 600,
                items   : [{
                    xtype       : 'containerquestions',      
                    tbarItems   : tbarItems,
                    newItems    : newItems
                }],
                dockedItems   : [
                    {
                        xtype	: 'toolbarSave',
                        cls     : 'widget-tool-button',
                        flex    : 1,
                        dock	: 'top',
                        items   : [
                            ,'->',
                            {
                                xtype   : 'saveButton',
                                ui      : 'header-red',
                                text    : 'Finalizar y envíar',
                                handler : function (b) {
                                    Ext.Msg.show({
                                        alwaysOnTop : true,
                                        title       : 'Guardar evaluación?',
                                        message     : 'Desea finalizar la evaluación y guardar los cambios?',
                                        buttons     : Ext.Msg.YESNO,
                                        icon        : Ext.Msg.QUESTION,
                                        fn: function(btn) {
                                            if (btn === 'yes') {
                                                b.up('window').savechanges();
                                            }
                                        }
                                    });
                                }
                            },
                            {
                                xtype   : 'imagecomponent',
                                glyph   : 'xf017@FontAwesome',
                                cls     : 'widget-name-text top-info-container',
                                html    : '39:59',
                                itemId  : 'clockButton'
                            },'-',
                            {
                                xtype   : 'imagecomponent',
                                glyph   : 'xf046@FontAwesome',
                                cls     : 'widget-name-text',
                                html    : 'Preguntas con respuesta 0/' + record.get('num_preguntas')+ ' ',
                                itemId  : 'requestButton'
                            },'-',
                            {
                                xtype   : 'closebutton'
                            }
                        ]
                    }
                ],
            }).show();
        });
    },

    replyEvaluation : function(grid, rowIndex){
        let rec     = grid.getStore().getAt(rowIndex),
            app     = Admin.getApplication();
            gb      = Global,
            socket  = gb.getSocket(),
            me      = this,
            dt      = new Date();

        socket.emit('sqlQuery',{
            dataName: Global.getDbName(),
            sql     : 'select CURDATE() fecha_sis,CURRENT_TIME() hora_sis, CAST(CURRENT_TIMESTAMP() AS CHAR) AS hora_inicio'
        },(err, data) => {
            if (data.length > 0){
                var hoy         = Ext.Date.format(dt, 'Y-m-d'),
                    db          = data[0],
                    dts         = new Date(db.fecha_sis),
                    hora_inicio = db.hora_inicio.toString(),
                    hoyS        = Ext.Date.format(dts, 'Y-m-d'),
                    contunue= false;
                // if (hoy == hoyS){
                    // if (!rec.get('estado')){
                    //     app.onError('La fecha se ha vencido.');
                    // }else {
                    //     contunue    = true;
					// }
					contunue    = true;
                    if (contunue){
                        xsocket = Global.getSocket();
                        xsocket.emit('querySelect',{
                            dataName    : Global.getDbName(),
                            fields      : 'COUNT(intento) total ',
                            table       : 'te_evaluation_result',
                            where       : 'shared_evaluation_id = ? ',
                            values      : [rec.get('id')]
                        },(err, res) => {
                            if(err){
                                app.showResult('Error en el servidor','error');
                                return;
                            }
                            if (res.length > 0) {
                                var val   = res[0].total;
                                Ext.create('Admin.view.docs.VideoView',{
                                    maxHeight  : 250,
                                    maxWidth   : 350,
                                    title   : rec.get('nombre'),
                                    alwaysOnTop	: false,
                                    items   :[
                                        {
                                            xtype   : 'form',
                                            items   : [
                                                {
                                                    xtype: 'container',
                                                    cls: 'widget-bottom-first-container postion-class',
                                                    height: 165,
                                                    padding: '30 0 0 0',
                                                    layout: {
                                                        type: 'vbox',
                                                        align: 'center'
                                                    },
                                                    items: [
                                                        {
                                                            xtype   : 'label',
                                                            cls     : 'widget-name-text',
                                                            html    : 'Intentos permitidos: '+rec.get('intentos')
                                                        },
                                                        {
                                                            xtype   : 'label',
                                                            cls     : 'widget-name-text',
                                                            html    : 'Limite de tiempo: '+rec.get('tiempo')+' minutos'
                                                        },
                                                        {
                                                            xtype   : 'label',
                                                            cls     : 'widget-name-text',
                                                            html    : 'Intentos realizados: '+val.toString()
                                                        },
                                                        {
                                                            xtype   : 'toolbar',
                                                            cls     : 'widget-tool-button',
                                                            flex    : 1,
                                                            items   : [
                                                                {
                                                                    ui      : 'soft-purple',
                                                                    iconCls : 'x-fa fa-check-square-o',
                                                                    text    : 'Responder evaluación',
                                                                    disabled: val < rec.get('intentos') ? false : true,
                                                                    handler : function (btn) {
                                                                        me.responseEvaluation(rec, btn, hora_inicio, val);
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }).show();
                            }
                        });
                    }
                // }else{
                //     app.onError('La fecha de su computador está mal configurada.')
                // }
            }
        });
        if (!rec.get('eread')) {
            rec.set('eread',1);
            grid.getStore().sync({
                success : function (r, o) {
                    var
                        socket  = Global.getSocket();
                    socket.emit('sendEvaluation',{
                        cfg : Global.getCfg()
                    },()=>{
                        socket.close();
                    });
                }
            });
        }
    },

    onCommentsActivities : function(grid, rowIndex){
        let
            record      = grid.getStore().getAt(rowIndex),
            items       = [],
            img         = record.get('image') ? rec.get('image') : Global.getAvatarUnknoun(),
            docente     = record.get('docente'),
            asignatura  = record.get('asignatura'),
            app         = Admin.getApplication(),
            view        = app.getMainView();
        if(view){
            app.setParamStore('CommentsActivitiesStore',{
                id  : record.get('id')
            });
            cont    = view.getController();
            cont.onRemove('commentsactivities');
            items.push(
                {
                    xtype       : 'form',
                    bodyPadding : 5,
                    ui          : 'panel-white', 
                    items   : [
                        {
                            xtype   : 'container',
                            height  : 82,
                            layout  : {
                                type    : 'hbox',
                                align   : 'stretch'
                            },
                            bodyCls     : 'statistics-body shadow',
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
                                        '<div class="user-info-d">'+asignatura+' - '+record.get('jornada')+'</div>'+
                                        '<div class="user-info-d">'+record.get('grado')+' - '+record.get('grupo')+'</div>'+
                                        '<div class="user-info-d">'+record.get('sede')+'</div>'
                                }
                            ]
                        },
                        {
                            xtype   : 'box',
                            cls     : 'mail-body',
                            html    :
                            '<br>'+
                            '<div class="user-name-d">'+record.get('nombre')+'</div>'+
                            '<div class="user-info-d">'+record.get('descripcion')+'</div>'
                        }
                    ],
                    bbar : [
                        '->',
                        {
                            xtype       : 'custombutton',
                            iconCls     : 'fas fa-comments',
                            text        : 'Responder',
                            handler     : function(){
                                Ext.create('Admin.view.general.SendFeedback',{
                                    title   : 'Agregar comentario a la actividad', 
                                    params  : {
                                        id          : record.get('id'), // Id de al actividad compartida
                                        activity_id : record.get('activity_id'), // Id de la actividad sin cursos a principal
                                        course_id   : record.get('course_id') // Id del curso al que pertence al actividad
                                    },  
                                    url     : Global.getUrlBase() +  'students/commentsactivities'
                                }).show().on('closed', function(me){
                                    if(me){
                                        me.close();
                                        Ext.getStore('CommentsActivitiesStore').reload();
                                    }
                                });
                            }
                        }
                    ]
                },
                {
                    xtype   : 'viewcommentsactivities'
                }
            );
            newView = Ext.create({
                xtype           : 'commentsactivities',
                routeId         : 'commentsactivities',
                activityId      : record.get('id'),
                newItems        : items,
                activityName    : record.get('nombre'),
                hideMode        : 'offsets'
            });
            cont.setChangeCurrentView('commentsactivities',newView);
        }
    },

    onConstancias : function (btn) {
		let enroll	= Global.getData().enrollment;
		if(enroll){
			let socket	= Global.getSocket();
			socket.emit('querySelect',{
				dataName    : Global.getDbName(),
				fields      : "*",
				table       : 'student_access',
				where       : 'enrollment_id = ? AND certificates = ? ',
				values      : [enroll[0].id,1]
			},(err, res)=>{
				if(err){
					Admin.getApplication().showResult('No tiene acceso','error');
					socket.close();
					return false;
				}
				if (res.length > 0){
					Ext.create('Admin.view.estudiantes.StudentConstancy',{
						title    : 'Constancia de estudio: ' + Global.getYear()
					}).show();
				}else{
					Admin.getApplication().showResult('No tiene acceso','error');
				}
				socket.close();
			});
		}
    },

    onBoletin : function (btn) {
		let enroll	= Global.getData().enrollment;
		let me   	= Admin.getApplication();
		if(enroll){
			let socket	= Global.getSocket();
			socket.emit('querySelect',{
				dataName    : Global.getDbName(),
				fields      : "*",
				table       : 'student_access',
				where       : 'enrollment_id = ? AND newsletters = ? ',
				values      : [enroll[0].id,1]
			},(err, res)=>{
				if(err){
					Admin.getApplication().showResult('No tiene acceso','error');
					socket.close();
					return false;
				}
				if (res.length > 0){
					extraParams = {
						pdbTable 	: 'periodos_academicos',
						pdbGrado	: Global.getData().enrollment[0].id_grade,
						pdbType		: 0
					}
					me.onStore('general.PeriodosStore');
					me.setParamStore('PeriodosStore',extraParams,false);
					Ext.create('Admin.view.estudiantes.StudentNewsLetter',{
						title   : 'Boletín académico: ' + Global.getYear()
					}).show();
				}else{
					Admin.getApplication().showResult('No tiene acceso','error');
				}
				socket.close();
			});
		}else{
			Admin.getApplication().showResult('No tiene acceso','error');
		}
    },

    onViewPerfil   : function () {
        var me   = this.app,
            win  = null,
            form = null;

        Ext.require([
            'Admin.store.estudiantes.perfil.PerfilEstudiantesStore',
            'Admin.view.estudiantes.perfil.PerfilEstudianteView'
        ]);

        Ext.onReady(function () {
            me.onStore('estudiantes.perfil.PerfilEstudiantesStore');
            var  cStore   = Ext.getStore('PerfilEstudiantesStore');

            cStore.reload({
                callback: function(records) {

                    win     = me.getWindow('Perfil del estudiante','Admin.view.estudiantes.perfil.PerfilEstudianteView');

                    form    = win.down('form');
                    form.loadRecord(records[0]);

                    win. show();
                }
            });
        });
    },
    onSavePerfil    : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            data    = [],
            store   = Ext.getStore('PerfilEstudiantesStore'),
            me      = this;
        if (!Ext.isEmpty(values.password_u) && !Ext.isEmpty(values.pasw2)){
            var
                p1      = Global.sha1.hash(values.password_u),
                p2      = Global.sha1.hash(values.pasw2);
        };

        if (p1 === p2) {
            data = {
            };

            values.password_u   = p1;
            values.pasw2        = p2;
            me.onDataSave(record, values, store, data, win);
            win.close();
        }else{
            Ext.Msg.alert('Las contraseñas no coinciden');
        }
    },
    viewNotes : function (btn) {
        let app     = Admin.getApplication(),
            win 	= btn.up('panel'),
            form	= win.down('form'),
            grid	= null,
            gb      = Global,
            me		= this,
			columns = [];
		let enroll	= Global.getData().enrollment;
		let socket	= Global.getSocket();
		socket.emit('querySelect',{
			dataName    : Global.getDbName(),
			fields      : "*",
			table       : 'student_access',
			where       : 'enrollment_id = ? AND notes = ? ',
			values      : [enroll[0].id,1]
		},(err, res)=>{
			if(err){
				Admin.getApplication().showResult('No tiene acceso','error');
				socket.close();
				return false;
			}
			if (res.length > 0){
				let socketB	= Global.getSocket();
				socketB.emit('querySelect',{
					dataName    : gb.getDbName(),
					fields      : "a.*, CONCAT('n',b.numero_column) col_name, b.tipo",
					table       : 'competencias a LEFT JOIN columnas_notas_competencias AS b ON b.id_competencia = a.id_pk',
					where       : 'a.year = ? AND a.calificable = ?  AND b.tipo = ? ',
					values      : [gb.getYear(),1, 'PORC']
				},(err, res)=>{
					if(err){
						app.showResult('Error en el servidor','error');
					}else{
						columns = [
							{
								xtype       : 'customrownumberer'
							},
							{
								text        : 'Asignaturas',
								dataIndex   : 'asignatura',
								width       : 300,
								menuDisabled: true,
								sortable    : true
							},
							{
								text        : 'Prom',
								dataIndex   : 'prom',
								menuDisabled: true,
								width       : 60
							},
							{
								text        : 'P',
								dataIndex   : 'periodo',
								tooltip     : 'periodo',
								menuDisabled: true,
								width       : 40
							}
						];
						res.forEach(ele => {
							let data    = {
								text        : ele.competencia + ' ' + ele.porcentaje + ' %',
								tooltip     : ele.competencia + ' ' + ele.porcentaje + ' %',
								menuDisabled: true,
								defaults    : {
									width               : 77,
									align               : 'right',
									menuDisabled        : true,
									cellWrap            : true,
									headerWrap          : true,
									variableRowHeight   : true,
									sortable            : true
								},
								columns: [
									{
										text        : 'NOTA',
										dataIndex   : ele.col_name,
										renderer: function (val) {
											return '<span style="color:Darkviolet;"> <b>' + val + '</b></span>'
										}
									}
								]
							};
							columns.push(data);
							// let 
							//     xsocket     = Global.getSocket();
							// xsocket.emit('querySelect',{
							//     dataName    : gb.getDbName(),
							//     fields      : "CONCAT('n',a.numero_column) col_name",
							//     table       : 'columnas_notas_competencias a',
							//     where       : 'a.id_competencia = ? AND a.tipo = ? ',
							//     values      : [ele.id_pk, 'PROM']
							// },(err, res)=>{
							//     console.log(res);
							//     if(res){
							//         if(res.length > 0){
							//             data.columns.push({
							//                 text        : '%',
							//                 dataIndex   : res[0].col_name,
							//                 renderer: function (val) {
							//                     return '<span style="color:red;"> <b>' + val + '</b></span>'
							//                 }
							//             });
							//             columns.push(data);
							//         }
							//     }
							// });
						});
		
						columns.push(
							{
								text        : 'FINAL',
								dataIndex   : 'final',
								menuDisabled: true,
								align       : 'right',
								summaryType : 'average',
								summaryRenderer: function (value) {
									return 'PROM: ' + value.toFixed(2).toString();
								},
								renderer: function (val) {
									return '<span style="color:red;"> <b>' + val + '</b></span>'
								}
							},
							{
								text        : 'Desempeño',
								width       : 100,
								menuDisabled: true,
								dataIndex   : 'nombre_escala',
								tooltip     : 'Escala de desempeño',
								renderer: function (val) {
									switch (val.trim()) {
										case 'BAJO':
											return '<span style="color:red;"> <b>' + val.trim() + '</b></span>';
											break;
										case 'BÁSICO':
											return '<span style="color:green;"> <b>' + val.trim() + '</b></span>';
											break;
										case 'ALTO':
											return '<span style="color:Darkviolet;"> <b>' + val.trim() + '</b></span>';
											break;
										case 'SUPERIOR':
											return '<span style="color:Steelblue;"> <b>' + val.trim() + '</b></span>';
											break;
									}
		
									return val;
								}
							},
							{
								text: 'FALTAS',
								menuDisabled: true,
								defaults: {
									width: 77,
									align: 'right',
									menuDisabled: true,
									cellWrap: true,
									headerWrap: true,
									variableRowHeight: true,
									sortable: true
								},
								columns: [
									{
										text        : 'J',
										dataIndex   : 'faltas',
										tooltip     : 'Faltas Justifcadas',
										summaryType : 'sum',
										summaryRenderer: function (value) {
											return 'T: ' + value.toString();
										}
									},
									{
										text        : 'I',
										dataIndex   : 'injustificadas',
										tooltip     : 'Faltas Injustifcadas',
										summaryType : 'sum',
										summaryRenderer: function (value) {
											return 'T: ' + value.toString();
										}
									},
									{
										text        : 'R',
										dataIndex   : 'retraso',
										tooltip     : 'Faltas por llegada tarde a clase',
										summaryType : 'sum',
										summaryRenderer: function (value) {
											return 'T: ' + value.toString();
										}
									}
								]
							}
						);
						/**/
						grid = new Ext.create('Admin.grid.CustomGrid', {
							itemId      : 'grid1',
							store       : 'NotasEstudiantesStore',
							plugins: [
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
							multiColumnSort: false,
							features: [{
								ftype: 'groupingsummary',
								startCollapsed: true,
								groupHeaderTpl: 'Periodo: {name} ({rows.length} Asignatura{[values.rows.length > 1 ? "s" : ""]})'
							}],
							columns: columns
						});
						form.remove('grid1', true);
						form.add(grid);
						socketB.close();
					}
				});
				
			}else{
				Admin.getApplication().showResult('No tiene acceso','error');
			}
			socket.close();
		});
    },
    onDocument : function (grid, rowIndex) {
        let
            rec     = grid.getStore().getAt(rowIndex),
            app     = Admin.getApplication(),
            socket  = Global.getSocket();
        if (Ext.isEmpty(rec.get('url_archivo'))) {
            app.showResult('No hay documento adjunto');
        }else {
            this.onViewDocument(rec.get('url_archivo'),rec.get('mime'));
              
            socket.emit('insertData',{
                dataName    : Global.getDbName(),
                table       : 'ta_online_activities_history',
                values      : {
                    shared_activity_id  : rec.get('id'),
                    url_archivo         : rec.get('url_archivo')
                }
            },(err, res, id)=>{
                if(err){
                    app.showResult('Error en el servidor.','error');
                    return;
                };
                socket.emit('updateData',{
                    dataName    : Global.getDbName(),
                    table       : 'ta_online_activities_history',
                    values      : [{
                        url_archivo : rec.get('url_archivo')
                    },{
                        id  : id
                    }]
                },(err, res)=>{
                    if(err){
                        app.showResult('Error en el servidor.','error');
                    };
                });
            });
        }
    },
    onVideo : function (grid, rowIndex, colIndex) {
        let 
            rec = grid.getStore().getAt(rowIndex),
            app = Admin.getApplication();
        if (Ext.isEmpty(rec.get('url_video'))) {
            app.showResult('No hay video adjunto');
        }else {
            let
                socket  = Global.getSocket(),
                xUrl    = rec.get('url_video'),
                retVal  = false,
                yt      = "https://www.youtube.com",
                rExp    = new RegExp(yt);
            rExp.exec(yt);
            retVal  = rExp.test(xUrl);
            if(retVal){ // Video en youtbe
                var
                    newUrl= xUrl.replace('watch?v=','embed/');
                cHtml ='<iframe width="100%" height="100%" src="'+newUrl+'?&autoplay=1" cc_load_policy=1 frameborder="0" allowfullscreen></iframe>';
            }else{
                var
                    cHtml  = '<object><embed  width="100%" height="100%" src="'+xUrl+'"></object>';
            }
            socket.emit('insertData',{
                dataName    : Global.getDbName(),
                table       : 'ta_online_activities_history',
                values      : {
                    shared_activity_id  : rec.get('id'),
                    url_video           : rec.get('url_video')
                }
            },(err, res, id)=>{
                if (err){
                    app.showResult('Error en el servidor.','error');
                }else {
                    Ext.create('Admin.view.docs.VideoView',{
                        html        : cHtml,
                        listeners   : {
                            cancel : function (me) {
                                xsocket  = Global.getSocket();
                                xsocket.emit('updateData',{
                                    dataName    : Global.getDbName(),
                                    table       : 'ta_online_activities_history',
                                    values      : [{
                                        url_video : rec.get('url_video')
                                    },{
                                        id  : id
                                    }]
                                },(err)=>{
                                    console.log(err);
                                });
                            }
                        }
                    }).show();
                }
            });
        }
    },
    onUrl : function (grid, rowIndex, colIndex) {
        let
            rec     = grid.getStore().getAt(rowIndex),
            app     = Admin.getApplication();
        if (Ext.isEmpty(rec.get('url_enlace'))) {
            app.showResult('No hay enlace adjunto');
        }else {
            let
                xUrl    = rec.get('url_enlace'),
                socket  = Global.getSocket(),
                cHtml   = '<object><embed  width="100%" height="100%" src="'+xUrl+'"></object>';
            socket.emit('insertData',{
                dataName    : Global.getDbName(),
                table       : 'ta_online_activities_history',
                values      : {
                    shared_activity_id  : rec.get('id'),
                    url_enlace          : rec.get('url_enlace')
                }
            },(err, res, id)=>{
                if(err){
                    app.showResult('Error en el servidor','error');
                    return;
                }
                Ext.create('Admin.view.docs.VideoView',{
                    title 	: 'Vista previa del enlace',
                    html  	: cHtml,
                    width   : 700,
                    height  : 550,
                    listeners : {
                        cancel : function (me) {
                            xsocket  = Global.getSocket();
                            xsocket.emit('updateData',{
                                dataName    : Global.getDbName(),
                                table       : 'ta_online_activities_history',
                                values      : [{
                                    url_enlace : rec.get('url_enlace')
                                },{
                                    id  : id
                                }]
                            },(err, res)=>{
                                console.log(err);
                            });
                        }
                    }
                }).show();
                app.onOpenUrl(xUrl);
            });
        }
    },

    /**
     * Funcion para setear los datos que se enviar al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn){
        var
            win     = btn.up('window'),
            enroll  = Global.getData().enrollment[0],
            name    = win.getItemId();
        switch (name){
            case 'studentconstancy' :
                var
                    url     = 'reports/report_constancias',
                    rbVal   = win.down('form').getValues(),
                    param   = {
                        pdbGrado    : enroll.id_grade,
                        pdbGrupo    : enroll.id_group,
                        pdbJorn     : enroll.id_study_day,
                        pdbMatric   : enroll.id,
                        pdbSede     : enroll.id_headquarters,
                        pdbType     : rbVal.modelo,
                        pdbEstudian : enroll.estudiante
                    };
                break;
            default :
                var
                    url     = 'reports/report_boletin',
                    values  = win.down('form').getValues(),
                    param   = {
                        pdbCodGrado : enroll.id_grade,
                        pdbIdJorn   : enroll.id_study_day,
                        pdbGrupo    : enroll.id_group,
                        pHojaReport : values.hoja,
                        pTypeReport : values.id_report,
                        pdbIdSede   : enroll.id_headquarters,
                        pdbPeriodo  : values.periodo,
                        pdbMatric   : enroll.id
                    };

                break;
        }
        this.onGenReport(btn,url,param);
    }
});
