
Ext.define('Admin.view.academico.controller.AcademicoController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.academico',
    init: function () {
        this.setConfigVar();
    },
    onDownloadExcelStudents : function(btn){
        let me  = Admin.getApplication(),
            app = this,
            ts  = btn.up('window');
        ts.mask('Descargando archivo...');
		const {school, profile}	= AuthToken.recoverParams();
        Ext.Ajax.request({
            url     : Global.getApiUrl() + '/download/excel/template-enrollment',
			headers: {
				'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
			},
			params: {
				schoolId  	: school.id || 0,
				profileId   : profile.id || 0,
				year        : school.year || dt.getFullYear(),
			},
            success : function (response) {
                ts.unmask();
				const obj = JSON.parse(response.responseText);
				if(obj.success  === true){
                    app.onOpenUrl(obj.pathFile);
                }else{
                    me.showResult('No se pudo descargar el archivo','error');
                }
            },
            failure: function (response, opts) {
                me.showResult('Error en el servidor, no se pudo descargar el archivo','error');
            },
            callback    : function (r, e) {
                ts.unmask();
            }
        });
    },
    onLoadExcelStudents : function(btn){
         Ext.create({
            xtype           : 'VideoView',
            alwaysOnTop     : true,
            maxWidth        : 600,
            maxHeight       : 230,
            items: [
                {
                    xtype       : 'form',
                    title       : 'Subir plantilla de inscripciones y matriculas',
                    bodyPadding : 10,
                    frame       : true,
                    items: [{
                        xtype       : 'FileField',
                        buttonOnly  : false,
                        labelWidth  : 50,
                        fieldLabel  : 'Archivo'
                    }],
                    buttons: [{
                        text    : 'Importar',
                        ui      : 'soft-green',
                        iconCls : 'x-fa fa-cloud-upload',
                        handler: function () {
                            let form    = this.up('form').getForm(),
                                win     = this.up('window'),
                                app     = Admin.getApplication();

                            Ext.define('Ext.ux.data.Html5Connection', {
                                override: 'Ext.data.Connection',
                                overrideAccept: true,
                                isHtml5Supported: function () {
                                    return typeof FileReader != "undefined";
                                },
                                isFormUpload: function (options) {
                                    return !this.isHtml5Supported() && this.callParent(arguments);
                                },
                                setOptions: function (options, scope) {
                                    var opts = this.callParent(arguments);
                                    if (this.isHtml5Supported() && options.isUpload && options.form) {
                                        opts.data = new FormData(options.form);
                                    }
                                    return opts;
                                },
                                createRequest: function (options, requestOptions) {
                                    var request = this.callParent(arguments);
                                    if (this.isHtml5Supported() && options.isUpload && options.progress) {

                                        if (!options.headers) options.headers = {};
                                        options.headers['Content-Type'] = null;
                                    }

                                    return request;
                                }
                            });
                            Ext.define('Ext.ux.data.Html5Request', {
                                override: 'Ext.data.request.Ajax',
                                openRequest: function (options, requestOptions, async, username, password) {
                                    var me = this;
                                    var xhr = this.callParent(arguments);
                                    if (options.isUpload && options.progress) {
                                        xhr.upload.onprogress = options.progress;
                                    }
                                    return xhr;
                                },
                                setupHeaders: function (xhr, options, data, params) {
                                    var acceptHeader = "Accept";
                                    if (this.overrideAccept && options.isUpload) {
                                        if (!options.headers) options.headers = {};
                                        options.headers[acceptHeader] = "text/html";
                                    }
                                    return this.callParent(arguments);
                                }
                            });
                            Ext.define('Ext.ux.form.action.Action', {
                                override: 'Ext.form.action.Action',
                                createCallback: function () {
                                    var me = this;
                                    var callback = this.callParent();
                                    callback.progress = function (e) {
                                        var prog = e.loaded / e.total;
                                        Ext.callback(me.progress, me.scope || me, [me, prog, e]);
                                    };
                                    return callback;
                                }
                            });

                            if (form.isValid()) {
								const {school, profile}	= AuthToken.recoverParams();
                                win.mask('Realizando petición');
                                form.submit({
                                    url     : Global.getApiUrl() + '/upload/excel/template-enrollment',
                                    waitMsg : 'Cargando plantilla..',
									headers: {
										'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
									},
									params: {
										schoolId  	: school.id || 0,
										profileId   : profile.id || 0,
										year        : school.year || dt.getFullYear(),
									},
                                    success: function (fp, o) {
										const obj = Ext.decode(o.response.responseText);
										win.unmask();
                                        if (obj.success === true) {
                                            Ext.getStore('InscripcionesStore').reload();
                                            app.showResult('La plantilla se ha importado correctamente.');
                                            win.close();
                                        } else {
                                            app.showResult('La plantilla no se ha importado.','error');
                                        }
                                    },
                                     //progress is [0..1], and event is the underlying HTML 5 progress event.
                                    progress: function (action, progress, event) {
                                        Ext.Msg.updateProgress(progress)
                                    },
                                    failure: function (f, e) {
                                        win.unmask();
                                        app.showResult('La plantilla no se pudo importar, ocurrió un error','error');
                                    }
                                });
                            }
                        }
                    }]
                }
            ]
        }).show();
    },
    onNovelty : function (btn) {
        const
            me      = Admin.getApplication(),
            eStore  = Ext.getStore('HistorialStore'),
            data    = btn.up('window').down('#gridMat').getSelection()[0],
            xparam  = {
                pdbTable    : 'registration_novelties',
                where       :  '{"id_register":"'+data.get('id')+'"}'
            };
			me.onStore('inscripciones.NoveltyStore');
            me.setParamStore('NoveltyStore',xparam, false);
		let win = Ext.create('Admin.view.academico.inscripciones.NoveltyView');
            win.setRecord(data);
            win.on('cancel', function(me){
                eStore.reload();
            });
            win.setAlwaysOnTop(true).show();
    },

	onTransferirNotasView : function (btn) {
        win = Ext.create('Admin.view.academico.NotasAcademicasTransView');
        win.show();
	},

	onTransferir : function (btn) {
		var win         = btn.up('window'),
			sel         = btn.up('window').down('grid').getSelection(),
			me          = Admin.getApplication(),
			cCount      = 0,
			data        = {},
			gb          = Global,
			store       = Ext.getStore('MatriculadosStore'),
			grado       = win.down('#cbGrados').getValue(),
			grupo       = win.down('#cbGrupos').getValue(),
			jorn        = win.down('#cbJornadas').getValue(),
			sede        = win.down('#cbSedes').getValue(),
			cgrado      = win.down('#comboGrados').getValue(),
			cgrupo      = win.down('#comboGrupo').getValue(),
			cjorn       = win.down('#comboJornadas').getValue(),
			csede       = win.down('#comboSedes').getValue();
		if(sel.length > 0){
			me.onMsgWait('Moviendo estudiantes...');
			if (win.down('#ckMoveNotes').getValue()) {
				if (grado == cgrado && grupo == cgrupo && jorn == cjorn && sede == csede ){
					ts.unmask();
					me.onAler('No se puede mover estudiantes al mismo, grado, grupo, sede y jornada.');
				}else {
					var
						values = [],
						param = {
							pdbList: sel
						};
					for (cCount = 0; cCount < sel.length; cCount++) {
						data = {
							id_matric: sel[cCount].get('id_matric')
						};
						Ext.Array.push(values, data);
					}
					param = {
						pdbList : Ext.encode(values),
						pdbGrado: grado,
						pdbGrupo: grupo,
						pdbJorn : jorn,
						pdbSede : sede,
						pdbGradoMove : cgrado
					};

					Ext.Ajax.request({
						url: gb.SetUrls.UrlBase + 'academic/get_mover_estudiantes',
						params: param,
						success: function (response, opts) {
							store.reload();
							ts.unmask();
							me.showResult('Se han guardado los cambios.');
						},
						failure: function (response, opts) {
							me.onError('Error en el servidor, codigo del estado ' + response.status);
						},
						callback    : function (r, e) {
							ts.unmask();
						}
					});
				}
			}else{
				for (cCount = 0; cCount < sel.length; cCount++) {
					data = {
						grupo       : grupo,
						id_jorn     : jorn,
						id_sede     : sede,
						id_grado   	: grado
					};
					sel[cCount].set(data);
				}
				store.sync({
					success     : function (s) {
						store.reload();
						ts.unmask();
						me.showResult('Se han guardado los cambios.');
					},
					callback    : function (r) {
						ts.unmask();
					}
				});
			}
		}else{
			me.onAler('No hay estudiantes para mover.');
		}
	},
	onSaveNuevos : function (btn) {
		var win     = btn.up('window'),
			me      = Admin.getApplication(),
			store	= Ext.getStore('PreMatriculaNuevosStore'),
			records = Ext.ComponentQuery.query('PreMatriculaNuevosView')[0].down('grid').getSelection(),
			values	= {},
			data	= [];
		ts.mask(AppLang.getSMsgLoading());
		Ext.each(records,function (record) {
			record.set('estado',1);
			values	= win.down('form').getValues();
			values.id_estado 	= 2;
			values.condicion 	= 1;
			values.situacion 	= 1;
			values.nuevo 		= 'No';
			values.repite 		= record.get('repite');
			values.subsidio 	= 'No';
			values.id	 	= record.get('id');
			values.promovido 	= 0;
			values.ins_proced	= record.get('ins_proced');
			data.push(values);
			values = {};
		});
		Ext.Ajax.request({
			url		: globales.SetUrls.UrlBase + 'General/insert_data',
			method	: 'POST',
			timeout	: 60000,
			params : {
				pdbTable 	: 'matriculas',
				records	: Ext.encode(data)
			},
			success: function(response, opts) {
				win.close();
				store.sync();
				store.reload();
				me.showResult('Proceso terminado.');
			},

			failure: function(response, opts) {
				console.log('server-side failure with status code ' + response.status);
			},

			callback	: function (res) {
				ts.unmask();
			}
		});
	},

	onSaveViejos : function (btn) {
		var win     = btn.up('window'),
			me      = Admin.getApplication(),
			store	= Ext.getStore('PreMatriculaViejosStore'),
			records = Ext.ComponentQuery.query('PreMatriculaViejosView')[0].down('grid').getSelection(),
			values	= {},
			data	= [];
		ts.mask(AppLang.getSMsgLoading());
		Ext.each(records,function (record) {
			record.set('estado','1');
			values	= win.down('form').getValues();
			values.id_estado 	= 2;
			values.condicion 	= 1;
			values.situacion 	= 1;
			values.nuevo 		= 'No';
			values.repite 		= 'No';
			values.subsidio 	= 'No';
			values.id	 	= record.get('id');
			values.promovido 	= 0;
			data.push(values);
			values = {};
		});
		Ext.Ajax.request({
			url		: globales.SetUrls.UrlBase + 'General/insert_data',
			method	: 'POST',
			timeout	: 60000,
			params : {
				pdbTable 	: 'matriculas',
				records	: Ext.encode(data)
			},
			success: function(response, opts) {
				win.close();
				store.sync();
				store.reload();
				me.showResult('Proceso terminado.');
			},

			failure: function(response, opts) {
				console.log('server-side failure with status code ' + response.status);
			},

			callback	: function (res) {
				ts.unmask();
			}
		});
	},

	onUpdateDocentesChange : function (btn) {
        var
            win     = btn.up('window'),
			grid    = win.down('grid'),
			record  = grid.getSelection()[0],
			values	= {},
			rec		= win.record;
		values.docente 		= record.get('nombres');
		values.id_docente	= record.get('id_docente');
		rec.set(values);
		win.close();
	},

	onUpdateAsignaturasChange : function (btn) {
		var win     = btn.up('window'),
			grid    = win.down('grid'),
			record  = grid.getSelection()[0],
			values	= {},
			rec		= win.record;
		values.asignatura 	= record.get('asignatura');
		values.id_asig		= record.get('id_pk');
		rec.set(values);
		win.close();
	},

	onUpdateJornadasChange : function (btn) {
		var win     = btn.up('window'),
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbJornadas'),
			values  = form.getValues();
		values.jornada = cb.getSelection().get('jornada');
		record.set(values);
		win.close();
	},

	onUpdateGruposChange : function (btn) {
		var win     = btn.up('window'),
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbGrupo'),
			values  = form.getValues();
		values.grado = cb.getSelection().get('grupo');
		record.set(values);
		win.close();
	},

	onUpdateGradosChange : function (btn) {
		var win     = btn.up('window'),
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbGrados'),
			values  = form.getValues();
		values.grado = cb.getSelection().get('grado');
		record.set(values);
		win.close();
	},

    onViewPreMatViejos : function (btn) {
        win = Ext.create('Admin.view.academico.PreMatriculaViejosView');
        win.show();
    },

    onViewPreMatNuevos : function (btn) {
        Ext.create('Admin.view.academico.PreMatriculaNuevosView').show();
    },

    onMayus : function (btn) {
        Ext.create('Admin.view.academico.MayusView').show();
    },

    onFichaObservador : function (btn) {
        this.redirectTo('fichaseguimiento',true);
    },
    onSaveActApoyo : function(btn) {
		const win = btn.up('window'),
			grid = win.down('grid'),
			store = Ext.getStore('RecuperacionesPeriodicasStore'),
			me = this,
			btn1 = win.down('#saveButton'),
			btn2 = win.down('#undoButton');
		let modified = store.getModifiedRecords();
        if(!Ext.isEmpty(modified)){
            grid.el.mask('Guardando…', 'x-mask-loading');

            store.sync({
                success: function(){
                    grid.el.unmask();
                    grid.getStore().commitChanges();
                    btn1.setDisabled(true);
                    btn2.setDisabled(true);
                    grid.getStore().reload();
                    me.app.showResult('Se han guardado los daros correctamente');
                },
                failure: function () {
                    grid.el.unmask();
                }
            });

        }else{
            btn1.setDisabled(true);
            btn2.setDisabled(true);
        }
    },

    onLisActApoyo : function (btn) {
		const win = btn.up('window'),
			select = win.getRecord(),
			app = Admin.getApplication(),
			btn1 = win.down('#printButton');
		if (!btn1.isDisabled()) {
            btn1.setDisabled(true);
        }
		let param = {
			pdbPeriodo	: win.down('#periodo').value,
			pdbTeacherId: select.get('id_docente'),
			pdbNivel	: win.down('#CbNivelAcademico').getValue()
		};
        app.setParamStore('RecuperacionesPeriodicasStore',param, true);
    },

    onActividadesApoyo : function (btn) {
        var
            me  = this.app;
        me.setParamStore('PeriodosStore',{
            pdbTable 	: 'periodos_academicos',
            pdbGrado	: 5,
            pdbType		: 2
        });
        Ext.create('Admin.view.academico.NivelacionesPeriodicas').show();
    },

    onMoveStudents : function (btn) {
		let win = btn.up('form'),
			sel = win.down('grid').getSelection(),
			me = Admin.getApplication(),
			cCount = 0,
			data = {},
			valForm = win.getValues(),
			store = Ext.getStore('MatriculadosStore'),
			grado = valForm.grados_id,
			grupo = valForm.grupo_id,
			jorn = valForm.jorn_id,
			sede = valForm.sedes_id,
			cgrado = valForm.id_grado,
			cgrupo = valForm.grupo,
			cjorn = valForm.cod_jorn,
			csede = valForm.id_sede;

		if(sel.length > 0){
            try {
                win.mask(AppLang.getSSavingChanges());
                if (grado === cgrado && grupo === cgrupo && jorn === cjorn && sede === csede) {
                    win.unmask();
                    me.onAler('No se puede mover estudiantes al mismo, grado, grupo, sede y jornada.');
                } else {
                    //Mover estudiantes con notas
                    if (win.down('#ckMoveNotes').getValue()) {
						let values = [];
						for (cCount = 0; cCount < sel.length; cCount++) {
                            data = {
                                id_matric: sel[cCount].get('id')
                            };
                            Ext.Array.push(values, data);
                        }
						const dt	= new Date();
						const {school, profile} = AuthToken.recoverParams();
                        const param = {
                            pdbList     : Ext.encode(values),
                            pdbGrado    : grado,
                            pdbGrupo    : grupo,
                            pdbJorn     : jorn,
                            pdbSede     : sede,
                            pdbGradoMove: cgrado,
							schoolId  	: school.id || 0,
							profileId   : profile.id || 0,
							year        : school.year || dt.getFullYear(),
                        };
                        Ext.Ajax.request({
                            url: Global.getApiUrl() + '/students/move-students',
                            params: param,
							headers: {
								'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
							},
                            success: function (response, opts) {
                                store.reload();
                                win.unmask();
                                me.showResult(AppLang.getSChangesOk());
                            },
                            failure: function (response, opts) {
                                me.onError('Error en el servidor, código del estado ' + response.status);
                            },
                            callback    : function (r, e) {
                                win.unmask();
                            }
                        });
                    } else {
                        for (cCount = 0; cCount < sel.length; cCount++) {
                            data = {
                                id_group        : grupo,
                                id_study_day    : jorn,
                                id_headquarters : sede,
                                id_grade        : grado
                            };
                            sel[cCount].set(data);
                        }
                        store.sync({
                            success     : function (s) {
                                store.reload();
                                win.unmask();
                                me.showResult(AppLang.getSChangesOk());
                            },
                            callback    : function (r) {
                                win.unmask();
                            }
                        });
                    }
                }
            } catch(e) {
                win.unmask();
            }
        }else{
            me.onAler('No hay estudiantes para mover.');
        }
    },

    onMoverEstudiantes : function (btn) {
        this.redirectTo('moverestudiantes');
    },

    onCuadroHonor : function (btn) {
        var
            me  = this.app;
        me.setParamStore('PeriodosStore', {
            pdbTable 	: 'periodos_academicos',
            pdbGrado	: 5,
            pdbType		: 0
        });
        Ext.create('Admin.view.academico.CuadroHonorView')
			.show();
    },

    onCertificados : function (btn) {
        this.redirectTo('certificados');
    },

    onConstancias : function (btn) {
        this.redirectTo('constancias');
    },

    addAsginaturas : function (btn) {
		let me = Admin.getApplication(),
			win = btn.up('window'),
			grid = win.down('#gridCarga'),
			select = grid.getSelection(),
			idMatric = win.down('grid').getSelection()[0].get('id'),
			store = null,
			grado = win.down('grid').getSelection()[0].get('id_grade'),
			data = {},
			per = win.down('#periodo').value,
			i = 0;
		if (select.length > 0 ) {
            if (!Ext.isEmpty(per)) {
                store = new Ext.create('Admin.store.base.StoreApi', {
                    fields: [
                        {name: 'id_curso'},
                        {name: 'id_matric'},
                        {name: 'periodo'}
                    ],
                    proxy: {
                        extraParams: {
                            pdbGrado: grado
                        },
                        api: {
                            create		: 'academic-notes/add-subjects',
                            read		: 'crud/index',
                            update		: 'crud',
                            destroy		: 'crud'
                        }
                    }
                });

                for (i = 0; i < select.length; i++) {
                    data = {
                        id_curso	: select[i].get('id'),
                        id_matric   : idMatric,
                        periodo     : per
                    };
                    store.insert(0, data);
                }
                store.sync({
                    success: function (r, e) {
                        me.onAler('Se insertaron las asignaturas correctamente...');
                    }
                });
            }else {
                me.onAler('Debe seleccionar un periodo...')
            }
        }else {
            me.onAler('Debe seleccionar una asignatura...')
        }
    },

    onSearchStudent : function (btn) {
        var extra   = {},
            me      = this.app;
        switch (btn.itemId) {
            case 'btnSearchApellido1' :
                value   = btn.up('window').down('#apellido1').getValue();
                type    = 1;
                break;
            case 'btnSearchApellido2' :
                value   = btn.up('window').down('#apellido2').getValue();
                type    = 2;
                break;
            case 'btnSearchNombre1' :
                value   = btn.up('window').down('#nombre1').getValue();
                type    = 3;
                break;
            case 'btnSearchNombre2' :
                value   = btn.up('window').down('#nombre2').getValue();
                type    = 4;
                break;
            default :
                value   = '';
                type    = 0;
                break;
        }

        extra   = {
            pdbSearch   : value,
            pdbType     : type
        };

        me.setParamStore('CandidatesSearchStore',extra,true);
    },

    onNotasAcademicas : function (btn) {
        win = Ext.create('Admin.view.academico.NotasAcademicasView');
        win.show();
    },

    onNotasReportadas : function (btn) {
        this.redirectTo('notasreportadas');
    },

    onSaveCarga : function (btn) {
		let win = btn.up('window'),
			selectAsig = win.down('#gridMatCurso').getSelection(),
			selectDocente = win.down('#gridDocente').getSelection()[0],
			me = Admin.getApplication(),
			cCount = 0,
			store = Ext.getStore('CargaStore');
		if (!Ext.isEmpty(selectAsig)) {
            if (!Ext.isEmpty(selectDocente)){
                win.down('#gridDocente').el.mask('Guardando…', 'x-mask-loading');
				const {school} 	= AuthToken.recoverParams();
				const dt		= new Date();
                for (cCount = 0; cCount < selectAsig.length; cCount++) {
                    const data = {
                        id_grado   	: selectAsig[cCount].get('id_grado'),
                        id_asig     : selectAsig[cCount].get('id_asig'),
                        id_docente  : selectDocente.get('id_docente'),
                        estado      : true,
                        id_sede     : win.down('#comboSedes').getSelection().data.ID,
                        grupo       : win.down('#comboGrupo').getSelection().data.grupo,
                        id_jorn     : win.down('#comboJornadas').getSelection().data.cod_jorn,
						year		: school.year || dt.getFullYear()
                    };
                    store.insert(0, data);
                }
                store.sync({
                    success: function () {
                        win.down('#gridDocente').el.unmask();
                        me.showResult('Se guardaron los datos correctamente');
                        store.reload();
                    },
                    failure: function () {
                        win.down('#gridDocente').el.unmask();
                        me.showResult('No se guardaron los datos correctamente')
                        store.reload();
                    }
                });
            }else {
                me.onAler('Debe seleccionar un docente.');
            }
        }else{
            me.onAler('Debe seleccionar al menos una asignatura para guardar.');
        }
    },

    onCreateCarga : function (btn) {
        win = Ext.create('Admin.view.academico.Carga');
        win.show();
    },

    onCreateArAsig : function (btn) {
        var me = Admin.getApplication(),
            record = btn.up('form').down('grid').getSelection()[0];
        me.setParamStore('AreasAsignaturaStore', {
            pdbTable: 'aux_asignaturas',
            pdbId: record.get('id_pk')
        }, false);
        Ext.create('Admin.view.academico.AreasAsignaturas',{
            record  : record
        }).show();
    },

    onCreateAsignaturasCert : function (btn) {
		const me = Admin.getApplication(),
			record = btn.up('form').down('grid').getSelection()[0];
		const param   = {
            pdbTable : 'asignaturas_certificados',
            pdbId    : record.get('id_pk')
        };
        me.setParamStore('AsignaturaCertificadoStore',param, false);
        let win = Ext.create('Admin.view.academico.AsignaturasCertificadosView');
        win.setRecord(record.getData());
		win.show();
    },

    onCreateAsignaturas : function (btn) {
        this.redirectTo('asignaturas');
    },

    onCreateAreas : function (btn) {
        this.redirectTo('areas');
    },

    onPhoto	: function (btn){
        Ext.require([
            'Admin.base.WinFoto'
        ]);
        Ext.onReady(function(){
            var me  	= Admin.getApplication(),
                grid	= Ext.ComponentQuery.query('InscripcionesCrudView')[0].down('grid'),
                record	= grid.getSelection()[0],
                title	= 'Documento - '+record.get('nombres'),
                win2 	= me.getWindow(title,'Admin.base.WinFoto'),
                dataDoc = btn.up('window').down('grid').getSelection()[0],
                foto	= '',
                mime	= '',
                img		= win2.down('#imgPhoto');
            if (btn.itemId == 'addButton'){
                extParam = {
                    pId : 0,
                    pAdd: 1,
                    pIdEst :  record.get('id')
                };
            }else{
                extParam = {
                    pId : dataDoc.get('id'),
                    pAdd: 0,
                    pIdEst :  record.get('id')
                };
                foto	= dataDoc.get('documento');
                mime	= dataDoc.get('mime');
                if(!Ext.isEmpty(foto) && !Ext.isEmpty(mime)){
                    imgUrl	="data:"+mime+";base64,"+foto;
                    img.setSrc(imgUrl);
                };
            };

            win2.urlPhoto 	= me.getUrlBase()+'academic/insert_archivos_digitales';
            win2.extParam	= extParam;
            win2.show();
        });
    },
	onViewWebcam	: function (btn) {
		var me  	= Admin.getApplication(),
            view    = btn.up('window') || btn.up('form'),
			rec 	= view.down('grid').getSelection()[0],
            store   = view.down('grid').getStore();
        me.onStore('docs.ImageBrowserStore');
        Ext.create({
            xtype           : 'FilesView',
            title           : 'Imagenes del estudiante',
            pathReadFile    : 'academic/read_images',
            pathUploadFile  : 'academic/upload_foto',
            titlePanelLoad  : 'Capturar',
            titlePanelView  : 'Mis imágenes',
            textButtonApply : 'Aceptar',
            extraParams     : {
                pdbCodEst   : rec.get('id')
            }
        }).show().on('afterselect',function (me, select) {
            rec.set('foto',select.data.path_set);
        }).on('apply',function (me) {
			store.sync();
			this.close();
        }).on('cancel',function (me) {
            store.rejectChanges();
        });
	},
    onViewArchivos : function (btn) {
		const me = Admin.getApplication(),
			rec = btn.up('window').down('grid').getSelection()[0];
		me.onStore('docs.ImageBrowserStore');
		let urlImage	= "";
		const win = Ext.create({
			xtype: 'FilesView',
			title: 'Seleccionar archivo',
			pathReadFile	: 'files/read',
			pathUploadFile	: 'files/upload',
			titlePanelLoad	: 'Subir archivos',
			titlePanelView	: 'Mis archivos',
			textButtonLoad	: 'Seleccionar una archivo en el equipo',
			textButtonApply : 'Establecer como avatar',
			extraParams: {
				belongToId	: rec.get('id'),
				fileProfile	: 'Student'
			},
			listeners: {
				afterselect: function (me, r) {
					urlImage	= r.get('url');
				}
			}
		});
		win.on('apply',function(me){
			if(isImage(urlImage)) {
				rec.set('foto',urlImage);
				rec.store.sync();
				win.close();
			}else {
				Ext.Msg.alert('Error', 'El archivo seleccionado no es una imagen');
			}
		});
		win.show();
    },
    onFamilies : function (btn) {
		const me = Admin.getApplication(),
			dataGrid = btn.up('window').down('grid').getSelection()[0];
		me.setParamStore('FamiliesStore', {
                pdbTable        : 'families'
            },false);
            Ext.create('Admin.view.academico.inscripciones.Families',{
                record  : dataGrid
            }).show();
    },

    onFamiliesStudent : function (btn) {
		const me = Admin.getApplication(),
			dataGrid = btn.up('window').down('grid').getSelection()[0];
		me.setParamStore('FamiliesStudentStore', {
                pdbTable        : 'aux_families_students',
                pdbIdStudent    :  dataGrid.get('id')
            },false);
            Ext.create('Admin.view.academico.inscripciones.FamiliesStudent',{
                record  : dataGrid
            }).show();
    },

    onViewReportes : function (btn) {
        this.redirectTo('reportes');
    },

    /**
     * Funcion para setear los datos que se enviar al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn){
		let url = '';
		var win = btn.up('window') || btn.up('form'),
			name = win.getItemId();
		switch (name){
            case 'PreMatriculaNuevosView' :
				url = 'reports/get_pre_matricula_nuevos';
				var param = {
					pdbTable: 'pre_matricula_nuevos'
				};
				break;
            case 'fichaseguimiento' :
				url = 'reports/observer-sheet';
				var values = win.down('grid').getSelection()[0],
					param = {
						pdbGrado: values.get('id_grade'),
						pdbGrupo: values.get('id_group'),
						pdbJorn: values.get('id_study_day'),
						pdbMatric: values.get('id'),
						pdbSede: values.get('id_headquarters'),
						pdbImage: values.get('foto'),
						pdbEstudian: values.get('nombres')
					};
				break;
            case 'nivelacionesperiodicasview' :
				let grid = btn.up('window').down('grid'),
					select = grid.getSelection()[0];
				url = 'reports/periodic-leveling';
				param  = {
                    pdbNivel    : win.down('#CbNivelAcademico').getValue(),
                    pdbGrado 	: '',
                    pdbTeacherId: select.get('id_docente'),
                    pdbPeriodo  : select.get('periodo')
                };
                break;
            case 'CuadroHonorView' :
				url = 'reports/honor-frame';
				var param = {
					pdbGrado: win.down('#comboGrados').getValue(),
					pdbGrupo: win.down('#comboGrupo').getValue(),
					pdbSede: win.down('#comboSedes').getValue(),
					pdbPeriodo: win.down('#per').getValue(),
					pdbPhoto: win.down('#ckPhoto').getValue() ? 1 : 0,
					pdbCkGrado: win.down('#ckGrado').getValue() ? 1 : 0,
					pdbCkSede: win.down('#ckSede').getValue() ? 1 : 0,
					pdbCkNivel: win.down('#ckNivel').getValue() ? 1 : 0,
					pdbLimit: win.down('#limit').getValue(),
					pdbNiv: win.down('#CbNivelAcademico').getValue(),
					pdbCk: win.down('#ckFin').getValue() ? 1 : 0
				};
				break;
            case 'NotasReportadasView' :
				url = 'reports/reported-notes';
				var values = win.down('#gridCarga').getSelection()[0],
					param = {
						pdbDocente: values.get('id_docente'),
						pdbPeriodo: win.down('#periodo').selection.get('periodo'),
						pdbType: 1
					};
				break;
            case 'ConstanciasView' :
				url = 'reports/certificate';
				var values = win.down('grid').getSelection()[0],
					rbVal = win.down('#rdGroup').getValue(),
					param = {
						pdbGrado	: values.get('id_grade'),
						pdbGrupo	: values.get('id_group'),
						pdbJorn		: values.get('id_study_day'),
						pdbMatric	: values.get('id'),
						pdbSede		: values.get('id_headquarters'),
						pdbType		: rbVal.modelo,
						pdbEstudian	: values.get('nombres')
					};
				break;
            case 'CertificadosView' :
				url = 'reports/periodic-certificate';
				var values = win.down('grid').getSelection()[0],
					rbVal = win.down('#rdGroup').getValue(),
					param = {
						pdbGrado: values.get('id_grade'),
						pdbGrupo: values.get('id_group'),
						pdbJorn: values.get('id_study_day'),
						pdbMatric: values.get('id'),
						pdbSede: values.get('id_headquarters'),
						pdbType: rbVal.modelo,
						pdbEstudian: values.get('nombres'),
						pdbPeriodo: win.down('#periodo').getValue()
					};
				break;
            default :
				url = 'reports/enrollment-sheet';
				var values = win.down('#gridMat').getSelection()[0],
					param = {
						pdbId: values.get('id'),
						pdbYear: values.get('year'),
						pdbGrado: values.get('id_grade'),
						pdbType: 1
					};
				break;
        }

        this.onGenReport(btn,url,param);
    },

    onViewIscripciones : function (btn) {
        Ext.create('Admin.view.academico.inscripciones.InscripcionesView').show();
    },
    onMatricula : function (btn) {
		const
			me = Admin.getApplication(),
			ts = btn.up('window');
		const
			data = ts.down('#gridMat').getSelection()[0],
			xparam = {
				pdbTable: 'student_enrollment',
				id: btn.itemId === 'btnNewMat' ? 0 : data.get('id'),
				where: `{"id": ${btn.itemId === 'btnNewMat' ? 0 : data.get('id')}}`
			},
			store = Ext.getStore('MatriculasStore'),
			record = ts.down('#studentgrid').getSelection()[0];
		me.setParamStore('MatriculasStore',xparam,false);
        ts.mask(AppLang.getSMsgLoading());
        store.load({
            scope: this,
            callback: function(records, operation, success) {
                ts.unmask();
                if (success){
                    win = Ext.create('Admin.view.academico.inscripciones.forms.MatriculasFormView');
                    var
                        form = win.down('form');
                    if (records.length === 1) {
                        form.loadRecord(records[0]);
                        form.down('#CbEstado').setReadOnly(true);
                        form.down('#CbEstado').setDisabled(true);
                        form.down('yearField').setReadOnly(true);
                        if(data.get('promoted')){
                            form.down('CbSedes').setDisabled(true);
                            form.down('CbGrupo').setDisabled(true);
                            form.down('CbGrados').setDisabled(true);
                            form.down('CbJornadas').setDisabled(true);
                            form.down('DateField').setReadOnly(true);
                            form.down('#inst_origin').setReadOnly(true);
                            form.down('#inst_address').setReadOnly(true);
                        }
                    }
                    win.setRecord(record);
                    win.setAlwaysOnTop(true).show();
                }
            }
        });
    }
});
