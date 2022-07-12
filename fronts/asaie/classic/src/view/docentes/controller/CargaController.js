/**
 * Created by LEWIS on 27/11/2015.
 */
Ext.define('Admin.view.docentes.controller.CargaController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.carga',
    task    : true,
    init    : function() {
        this.setConfigVar();
        this.control({
            'notasacademicasdocentes grid' : {
                itemclick : this.onClickGridNotas
            }
        });
    },

    onDownloadExcel : function (btn) {
        var
            me  = this,
            win = btn.up('form'),
            rc	= win.down('#CbCarga').getSelection(),
            rp	= win.down('#periodo').getSelection(),
            cUrl= Global.getUrlBase() + 'excel_manager/exportar_notas_asignatura';
        extra	= {
            pdbIdAsig	: rc.get('id_asig'),
            pdbGrado	: rc.get('id_grado'),
            pdbGrupo	: rc.get('grupo'),
            pdbPeriodo  : rp.get('periodo'),
            pdbJornada  : rc.get('id_jorn'),
            pdbSede     : rc.get('id_sede'),
            pdbCurso    : rc.get('id')
        };
        me.onStopTimer(btn);
        Ext.Ajax.request({
            url     : cUrl,
            params  : extra,
            timeout : 0,
            success : function(response, opts) {
                var obj = Ext.decode(response.responseText);
                me.onOpenUrl(obj.pathFile);
            },
            failure: function(response, opts) {
                me.app.onError('Ocurrio un error al tratar de exportar la plantilla');
            }
        });
    },

    onLoadExcel : function (btn) {
        var win 	= btn.up('form'),
            me		= this,
            glo     = Global,
            addLind = glo.getData().config_bol[0].permi_ind,
            rerult  = false,
            msg     = '';
        me.onStopTimer(btn);
        if(addLind == '5'){
            rerult = true;
        }else{
            if (glo.getIndicatorsRecord().length > 0 && glo.getRecordAchievements().length > 0) {
                rerult = true;
            }else if(glo.getIndicatorsRecord().length > 0 && !glo.getRecordAchievements().length > 0){
                switch (addLind) {
                    case   '1' :
                        rerult  = true;
                        break;
                    case   '2' :
                        rerult  = false;
                        msg     = 'Debe digitar primero los INDICADORES - DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                    case   '3' :
                        rerult  = true;
                        break;
                    case   '4' :
                        rerult  = false;
                        msg     = 'Le falta digitar los DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                    default :
                        rerult  = true;
                        break;
                }
            }else if(!glo.getIndicatorsRecord().length > 0 && glo.getRecordAchievements().length > 0){
                switch (addLind) {
                    case   '1' :
                        rerult  = true;
                        break;
                    case   '2' :
                        rerult  = false;
                        msg     = 'Debe digitar primero los INDICADORES - DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                    case   '3' :
                        rerult  = false;
                        msg     = 'Le falta digitar los indicadores de DESEMPEÑO para poder generar los desempeños.';
                        break;
                    case   '4' :
                        rerult  = true;
                        break;
                    default :
                        rerult  = true;
                        break;
                }
            }else {
                switch (addLind) {
                    case   '1' :
                        rerult  = true;
                        break;
                    case   '5' :
                        rerult  = true;
                        break;
                    default :
                        rerult  = false;
                        msg     = 'Debe digitar primero los INDICADORES - DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                }
            }
        };

        var
            winM = btn.up('form'),
            rc	= winM.down('#CbCarga').getSelection(),
            rp	= winM.down('#periodo').getSelection(),
            btnSearch = winM.down('#btnSearch'),
            extra	= {
                pdbAsig		: rc.get('id_asig'),
                pdbGrado	: rc.get('id_grado'),
                pdbGrupo	: rc.get('grupo'),
                pdbPeriodo  : rp.get('periodo'),
                pdbJornada  : rc.get('id_jorn'),
                pdbSede     : rc.get('id_sede'),
                pdbCurso    : rc.get('id')
            };
        if (rerult) {
            Ext.require('Admin.view.docs.VideoView');
            Ext.onReady(function () {
                win = Ext.create({
                    xtype       : 'VideoView',
                    alwaysOnTop : false,
                    maxWidth    : 600,
                    maxHeight   : 230,
                    items: [
                        {
                            xtype: 'form',
                            title: 'Subir plantilla de notas',
                            bodyPadding: 10,
                            frame: true,
                            items: [{
                                xtype       : 'FileField',
                                buttonOnly  : false,
                                labelWidth  : 50,
                                fieldLabel  : 'Archivo'
                            }],
                            buttons: [{
                                text    : 'Imprtar',
                                ui      : 'soft-green',
                                iconCls : 'x-fa fa-cloud-upload',
                                handler : function () {
                                    var form = this.up('form').getForm(),
                                        app = Admin.getApplication();

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
                                        form.submit({
                                            url     : Global.getUrlBase()   + 'excel_manager/upload_plantilla',
                                            params  : extra,
                                            waitMsg : 'Cargando plantilla..',
                                            success: function (fp, o) {
                                                var obj = Ext.decode(o.response.responseText);
                                                if (obj.estado == 1) {
                                                    app.showResult('La plantilla se ha importado correctamente.');
                                                    btnSearch.click();
                                                    win.close();
                                                } else {
                                                    app.onAler('La plantilla no corresponde al curso donde desea importarla.');
                                                }
                                            },
                                            failure: function (f, e) {
                                                app.onError('La plantilla no se pudo importar, ocurrio un error');
                                            }
                                        });
                                    }
                                }
                            }]
                        }
                    ]
                });
                win.show();
            });
        }else{
            me.app.onAler(msg);
        }
    },

    /**
     * Funcion para auto guardar los cambioss en la platilla de notas
     */
    onStopTimer : function (btn) {
      var
          me = this,
          lb	= btn.up('form').down('#lbClock');
        lb.setText('Auto guardar en 0 SEG.');
        Ext.TaskManager.stop(me.task);
        Ext.TaskManager.stopAll;
        Ext.TaskManager.destroy;
    },
    
    onAutoSave : function (btn) {
        var me	= this,
            lb	= btn.up('form').down('#lbClock'),
            cb  = btn.up('form').down('#CbCarga').selection;

        var runner 	= null,
            task, xStore,
            count		= 0,
            next        = 0;

        xStore  = Ext.getStore('NotasStore');
        text	= 20;
        me.task	= Ext.TaskManager.start({
            run	: function () {
                next	++;
                count = text - next;
                lb.setText('Auto guardar en '+count.toString()+' SEG.');

                if(count == 0) {
                    lb.setText('Auto guardar en '+text+' SEG.');
                    count	= 0;
                    next	= 0;
                    modified = xStore.getModifiedRecords();
                    if(modified.length > 0){
                        me.onStopTimer(btn);
                        xStore.sync(
                            {
                                success: function(batch) {
                                    me.app.showResult('Se han guardado los datos correctamente');
                                },
                                failure : function (batch) {
                                    me.app.showResult('No se ha podido guardar los datos');
                                }
                            }
                        );
                    }
                }

            },
            interval	: 1000
        });

    },
    /**
     * Funcion que se ejecuta caundo se pulsa el boton cerrar
     * de la Vista notas acadademicas
     * @param btn
     * @param e
     * @param eOpts
     * @constructor
     */
    onClickClose : function (btn){
        var 
            form	= btn.up('form'),
            grid 	= form.down('grid'),
            me      = this;
        me.onStopTimer(btn);
        if (grid == null){
            // form.reset();
            // form.remove('notasGrid',true);
            me.redirectTo('dashboard', true);
        }else{
            var	data    = grid.getSelection()[0];
            if (!Ext.isEmpty(data)) {
                var	store 	= grid.getStore(),
                    me		= this,
                    cbtn	= btn,
                    ce		= e,
                    ceOpts	= eOpts,
                    data    = grid.getSelection()[0];
                modified = store.getModifiedRecords();
                if(Ext.isEmpty(modified)) {
                    // form.reset();
                    // form.remove('notasGrid',true);
                    me.redirectTo('dashboard', true);
                }else{
                    Ext.Msg.show({
                        title   : 'S.M.E. ...Guardar datos',
                        message : 'Se han modificado datos, desea guardarlos?',
                        buttons : Ext.Msg.YESNO,
                        icon    : Ext.Msg.QUESTION,
                        fn: function(btn) {
                            if (btn === 'yes') {
                                if (Global.getScale().length > 0){
                                    me.onClickCalcular(cbtn, ce, ceOpts);
                                }
                                grid.el.mask('Guardando…', 'x-mask-loading');
                                store.sync({
                                    success: function(batch) {
                                        me.app.showResult('Se han guardado los datos correctamente');
                                    },
                                    failure : function (batch) {
                                        me.app.showResult('No se ha podido guardar los datos');
                                    },
                                    callback : function (batch) {
                                        grid.el.unmask();
                                        // form.reset();
                                        // form.remove('notasGrid',true);
                                        me.redirectTo('dashboard', true);
                                    }
                                });

                            }else{
                                store.rejectChanges();
                                // form.reset();
                                // form.remove('notasGrid',true);
                                me.redirectTo('dashboard', true);
                            }
                        }
                    });
                }
            }else{
                // form.reset();
                // form.remove('notasGrid',true);
                me.redirectTo('dashboard', true);
            }

        }
    },

    /**
     * Funcion que se ejecuta cuando se selecciona un periodo del comboBox
     * que está en la vista de notas académicas
     * @param combo
     * @param records
     * @param eOpts
     * @constructor
     */
     

    onSelectionNotas: function	(btn) {
        var	me		= this,
            win		= btn.up('form'),
            data    = win.down('#CbCarga').selection,
            grado 	= data.get('id_grado'),
            cPeriodo= win.down('#periodo').selection,
			cUrl    = Global.getUrlBase()+'c_sql/get_competencias',
            cUrl2   = Global.getUrlBase();
        st  = Ext.getStore('ColumnDocentesStore');
        me.onStopTimer(btn);
		win.mask('Cargando notas');
        if (!Ext.isEmpty(cPeriodo)) {
			Ext.Ajax.request({
				url: cUrl,
				params : {
					idGrado: grado
				},
				success: function(response){
					result 	= Ext.decode(response.responseText);
					Global.setCompetences(result.records_comp);
					Global.setScale(result.records_des);
					Global.setColumnsNotes(result.records_colum);
					Global.setDbConfig(result.records_config);
					Global.setConfigReport(Global.getData().config_bol);
					st.reload({
						callback	: function () {
							Ext.Ajax.request({
								url: cUrl2 + 'c_notas/logros_estandares_verify',
								params: {
									pdbGrado: grado,
									pdbPerio: cPeriodo.get('periodo'),
									pdbAsig : data.get('id_asig')
								},
								success: function (response) {
									obj = Ext.decode(response.responseText);
									Global.setIndicatorsRecord(obj.indicadores);
									Global.setRecordAchievements(obj.logros);
								}
							});
							Global.setPeriod(cPeriodo.get('periodo'));
							me.onGetPrimaria(btn);
							win.unmask();
						}
					});
				},
				failure: function (response) {
                    win.unmask();
					me.app.onMsgClose();
					me.app.onAler('No se pueden cargar los datos');
				}

			});
        }else{
            win.unmask();
            me.app.onMsgClose();
            me.app.onAler('Debe seleccionar un periodo...');
        }
    },

    /**
     * Funcion que se ejecuta cuando se hace click sobre una fila del grid
     * de la vista notas academicas
     * @param grid
     * @param record
     * @param item
     * @param index
     * @param e
     * @param eOpts
     * @constructor
     */

    onClickGridNotas : function (grid) {

        var win		= grid.up('form'),
            btn3	= win.down('#btnCalcular'),
            btn4	= win.down('#menuConfigSugerencias'),
            btn7	= win.down('#menuConfigLogros'),
            btn5	= win.down('#btnConfig'),
            btn6	= win.down('#btnDesempen'),
            data    = win.down('#CbCarga').getSelection(),
            gb      = Global
			nivel 	= data.get('id_nivel');
        if (nivel > 1)	{
            if (btn3.isDisabled()) {
                btn3.setDisabled(false);
            }
            if (btn4.isDisabled()) {
                btn4.setDisabled(false);
            }
            if (btn7.isDisabled()) {
                btn7.setDisabled(false);
            }
            if (btn5.isDisabled()) {
                btn5.setDisabled(false);
            }
        }else{
            if (gb.getScale().length > 0){
                if (btn3.isDisabled()) {
                    btn3.setDisabled(false);
                }
                if (btn4.isDisabled()) {
                    btn4.setDisabled(false);
                }
                if (btn7.isDisabled()) {
                    btn7.setDisabled(false);
                }
                if (btn5.isDisabled()) {
                    btn5.setDisabled(false);
                }
            }else{
                if (!btn5.isDisabled()) {
                    btn5.isDisabled(true);
                }
                if (!btn3.isDisabled()) {
                    btn3.isDisabled(true);
                }
                if (btn6.isDisabled()) {
                    btn6.isDisabled(false);
                }
				if (btn4.isDisabled()) {
					btn4.setDisabled(false);
				}
				if (btn7.isDisabled()) {
					btn7.setDisabled(false);
				}
            }
        }
    },

    /**
     * Funcion que se ejecuta cuando se pulsa el boton guardar
     * en la vista de notas académicas
     * @param btn
     * @param e
     * @param eOpts
     * @constructor
     */
    onClickSave	:  function(btn, e, eOpts) {
        var win 	= btn.up('form'),
            grid 	= win.down('#notasGrid'),
            store 	= grid.getStore(),
            me		= this,
            btn1	= win.down('#btnSave'),
            btn2	= win.down('#btnUndo');
        me.onStopTimer(btn);
        // Obtiene los campos modificados
        modified = store.getModifiedRecords();
        // Si hay campos modificados los guarda
        if(modified.length > 0){
            win.mask('Guardando…', 'x-mask-loading');
            store.sync({
                success: function(batch) {
                    me.app.showResult('Se han guardado los datos correctamente');
                    store.reload();
                },
                failure : function (batch) {
                    me.app.showResult('No se ha podido guardar los datos');
                },callback : function(){
                    win.unmask();
                }
            });

        }else{
            btn1.setDisabled(true);
            btn2.setDisabled(true);
            me.app.showResult('No hay cambios que guardar');
        }
    },

    /**
     * Funcion que se ejcuta cuando se pulsa el boton deshacer
     * en la vista de notas académicas
     * @param btn
     * @param e
     * @param eOpts
     * @constructor
     */

    onClickUndo : function(btn, e, eOpts) {
        var win 	= btn.up('form'),
            grid 	= win.down('#notasGrid'),
            store 	= grid.getStore(),
            btn1	= win.down('#btnSave'),
            btn2	= win.down('#btnUndo');
        this.onStopTimer(btn);
        btn1.setDisabled(true);

        btn2.setDisabled(true);

        store.rejectChanges();
    },

    /**
     * Funcion que se ejecuta cuando se pulsa el boton calcular
     * en la vista de notas académicas
     * @param btn
     * @param e
     * @param eOpts
     * @constructor
     */

    onClickCalcular : function(btn, e, eOpts) {
        var win 	        = btn.up('form'),
            grid 	        = win.down('grid'),
            aStore 	        = grid.getStore(),
            btn1	        = win.down('#btnSave'),
            btn2	        = win.down('#btnUndo'),
            me		        = this,
            glo             = Global,
            addLind         = parseInt(glo.getConfigReport()[0].permi_ind),
            rerult          = false,
			dbConfig        = Global.getDbConfig(),
			hasta	        = 0,
			_n_red	        = 0,
			_n_final_red	= 0,
			_n_aplica		= 0,
            msg     = '';
		me.onStopTimer(btn);
		console.log(addLind);
        if(addLind === 5){
            rerult = true;
        }else{
            if (glo.getIndicatorsRecord().length > 0 && glo.getRecordAchievements().length > 0) {
                rerult = true;
            }else if(glo.getIndicatorsRecord().length > 0 && !glo.getRecordAchievements().length > 0){
                switch (addLind) {
                    case   1 :
                        rerult  = true;
                        break;
                    case   2 :
                        rerult  = false;
                        msg     = 'Debe digitar primero los INDICADORES - DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                    case   3 :
                        rerult  = true;
                        break;
                    case   4 :
                        rerult  = false;
                        msg     = 'Le falta digitar los DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                    default :
                        rerult  = true;
                        break;
                }
            }else if(!glo.getIndicatorsRecord().length > 0 && glo.getRecordAchievements().length > 0){
                switch (addLind) {
                    case   '1' :
                        rerult  = true;
                        break;
                    case   '2' :
                        rerult  = false;
                        msg     = 'Debe digitar primero los INDICADORES - DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                    case   '3' :
                        rerult  = false;
                        msg     = 'Le falta digitar los indicadores de DESEMPEÑO para poder generar los desempeños.';
                        break;
                    case   '4' :
                        rerult  = true;
                        break;
                    default :
                        rerult  = true;
                        break;
                }
            }else {
                switch (addLind) {
                    case   '1' :
                        rerult  = true;
                        break;
                    case   '5' :
                        rerult  = true;
                        break;
                    default :
                        rerult  = false;
                        msg     = 'Debe digitar primero los INDICADORES - DESEMPEÑOS - LOGROS para poder generar los desempeños.';
                        break;
                }
            }
        }
        if (rerult) {
            grid.el.mask('Generando promedios', 'x-mask-loading');
            if (btn1.isDisabled()) {
                btn1.setDisabled(false);
            }
            if (btn2.isDisabled()) {
                btn2.setDisabled(false);
            }
			grid.el.mask('Generando promedios', 'x-mask-loading');
			Ext.each(dbConfig,function(data,i) {
				_n_aplica	= data.aplicar_redondeo_fin_año;
				_n_final_red= parseFloat(data.nota_final_redondeo);
				_n_red		= parseFloat(data.nota_redondeo);
				Ext.each(Global.getScale(),function (d) {
					if(d.reprueba > 0){
						hasta = parseFloat(d.hasta);
					}
				});
			});
			aStore.each(function (rec, index) {
				x		= 0;
				nFinal	= 0;
				Ext.each(Global.getCompetences(),function (data) {
					x	= ++x;
					var
						pA	= parseFloat(rec.get('proc'+x.toString())).toFixed(2),
						pB	= parseFloat(data.porcentaje).toFixed(2),
						p	= isNaN(pA) ? pB : pA == 0 ?  pB : pA,
						val	= parseFloat(me.onEachColumsCalcular(p,data.id_pk,rec));
					nFinal = nFinal + val ;
				});
				if(_n_red > 0 && _n_aplica > 0){
					if((nFinal >= _n_red) && (nFinal <= hasta)){
						nFinal	= _n_final_red;
					}
				}
				rec.set('final',nFinal.toFixed(2));
				aDesempeño 	= me.getDesempeños(nFinal.toFixed(2));
				escala		= me.getEscala(nFinal.toFixed(2));
				rec.set('nombre_escala',aDesempeño);
				rec.set('id_escala',escala);
			});
			grid.el.unmask();

            modified = aStore.getModifiedRecords();
            if (modified.length > 0){
               me.onAutoSave(btn);
            }
        }else{
            Admin.getApplication().onAler(msg);
        }

    },

	/*
    * Funcion que retorna la escala de notas.
    */
	getEscala	: function (nValue) {
		var
			nLength = Global.getScale().length,
			x 		= 0,
			result	= '';

		for(x = 0; x < nLength; x++){
			desde	= parseFloat(Global.getScale()[x].desde);
			hasta	= parseFloat(Global.getScale()[x].hasta);

			if(nValue>=desde && nValue<=hasta){
				result = Global.getScale()[x].id_escala;
				break;
			}
		}
		return result;
	},

	/*
     * Funcion que retorna desempeño de la nota final de cada periodo de cada estudiantes.
     */
	getDesempeños 	: function (nValue) {
		var
			nLength = Global.getScale().length,
			x 		= 0,
			result	= '';

		for(x = 0; x < nLength; x++){
			desde	= parseFloat(Global.getScale()[x].desde);
			hasta	= parseFloat(Global.getScale()[x].hasta);

			if(nValue>=desde && nValue<=hasta){
				result = Global.getScale()[x].nombre_escala;
				break;
			}
		}
		return result;
	},

	onEachColumsCalcular : function (p, idComp,record) {
		var
			nota 	= 0,
			suma 	= 0,
			prom 	= 0,
			porc	= 0,
			cont	= 0,
			porNota	= 0,
			sumaPor	= 0,
			notaSuma= 0,
			sumaProm= 0,
			contNota= 0,
			porcient= 0,
			colProm	= '',
			colPorc	= '',
			activa	= false,
			porNotaM= 0,
			st  	= Ext.getStore('ColumnDocentesStore');
		st.each(function (data) {
			if (data.get('id_competencia') == idComp){
				switch (data.get('tipo')){
					case 'NOTA' :
						activa	= data.get('activa');
						if (activa){ // Si la columna está visible o activa
							nota	= parseFloat(record.get(data.get('name_column')));
							porNota	= parseFloat(data.get('porciento'));
							porNotaM= parseFloat(data.get('porcentual'));
							if (nota > 0){
								if (porNotaM != porNota	){
									if(porNotaM > 0){
										sumaPor = sumaPor + (nota * porNotaM / 100);
										porcient= porcient + porNotaM;
									}else {
										notaSuma = notaSuma + nota;
										contNota = ++contNota;
									};
								}else{
									if(porNota > 0){
										sumaPor = sumaPor + (nota * porNota / 100);
										porcient= porcient + porNota;
									}else {
										notaSuma = notaSuma + nota;
										contNota = ++contNota;
									};
								}
								suma = suma + nota;
								cont = ++cont;
							}
						}
						break;
					case 'PROM' :
						colProm	= data.get('name_column');
						break;
					case 'PORC' :
						colPorc	= data.get('name_column');
						break;
				}
			}
		});
		if (suma > 0){
			prom	= (suma/cont).toFixed(2);
			if (sumaPor > 0){
				if(notaSuma > 0	){
					sumaProm = (notaSuma/contNota).toFixed(2);
					if (p > porcient){
						sumaProm = (sumaProm *(p - porcient) /100);
						porc 	 = (sumaPor + sumaProm);
					}else{
						porc 	 = sumaPor;
					}
				}else {
					porc 	 = sumaPor;
				}
			}else{
				porc 	= (prom * p)/100;
			}
			colProm.length > 0 ? record.set(colProm,prom > 0 ? parseFloat(prom).toFixed(2) : 0) :  colProm = '';
			colPorc.length > 0 ? record.set(colPorc,porc > 0 ? parseFloat(porc).toFixed(2) : 0) :  colPorc = '';
		}
		return porc ? porc.toFixed(2) : 0;
	},

    /**
     * Funcion que carga la vista para insertar las sugerencias u observaciones
     * a los estudiantes.
     * @param menu
     * @param item
     * @param e
     * @param eOpts
     * @constructor
     */

    onAddSugerencias : function(btn) {
        var
            record      = btn.up('form').down('#CbCarga').getSelection(),
            modified    = btn.up('form').down('grid').getStore().getModifiedRecords(),
            periodo     = Global.getPeriod(),
            select      = btn.up('form').down('grid').getSelection(),
            app	        = this.app;
        if (Ext.isEmpty(modified)) {
            if (select.length > 0) {
                extra = {
                    pdbPeriodo  : periodo,
                    pdbGrado 	: record.get('id_grado'),
                    pdbTable    : 'sugerencias'
                };
                app.setParamStore('SugerenciasInsertStore',extra);
                app.setParamStore('SugerenciasStore',extra);
                this.onStopTimer(btn);
                Ext.create('Admin.view.docentes.SugerenciasInsertView',{
                    title   : 'Asignar Sugerencias u observaciobes',
                    records : select
                }).show();
            }else{
                app.onAler('Debe seleccionar al menos un estudiante...');
            }
        }else {
            app.onAler('Para realizar esta operación debe guardar los cambios pendientes en las notas.');
        }
    },

    /**
     * Funcion que se ejecuta para cargar la vista de insertar logros en indicadores de desempeño
     * personalizados a los estudiantes
     * @param menu
     * @param item
     * @param e
     * @param eOpts
     */

    onClickLogros : function(btn) {
        var
            record  = btn.up('form').down('#CbCarga').getSelection(),
            modified= btn.up('form').down('grid').getStore().getModifiedRecords(),
            select  = btn.up('form').down('grid').getSelection(),
            app	    = this.app;
        if (Ext.isEmpty(modified)) {
            if (select.length > 0) {
                this.onStopTimer(btn);
                ExExParams = {
                    pdbGrado 	: record.get('id_grado'),
                    pdbAsig  	: record.get('id_asig'),
                    pdbGrupo 	: record.get('grupo'),
                    pdbSede   	: record.get('id_sede'),
                    pdbJorn   	: record.get('id_jorn'),
                    pdbType   	: 0,
                    pdbCurso  	: record.get('id'),
                    pdbTable  	: 'logros_estandares',
                    pdbPeriodo  : Global.getPeriod()
                };
                app.setParamStore('LogrosStore', ExExParams);
                app.setParamStore('LogrosEstandarStore', ExExParams);
                Ext.create('Admin.view.docentes.DescriptoresInsertView',{
                    title   : 'Asignar Descriptores a estudiantes',
                    records : select
                }).show();
            }else{
                app.onAler('Debe seleccionar al menos un estudiante...');
            }
        }else {
            app.onAler('Para realizar esta operación debe guardar los cambios pendientes en las notas.');
        }
    },

    /**
     * Funcion que abre la vista para configurar las columnas de la grilla
     * @param btn
     * @param e
     * @param eOpts
     */

    onViewConfig : function	(btn) {
        me.onStopTimer(btn);
        Ext.create('Admin.view.docentes.ConfigColumnView').show();
    },

    /**
     * Funcion que crea la vista para agregar desempeños a los estudiantes
     * del cliclo preescolar
     * @param btn
     * @param e
     * @param eOpts
     */
    onClickDesemp : function	(btn, e, eOpts) {
        var     me		= Admin.getApplication(),
                select  = btn.up('form').down('grid').getSelection();
        if (select.length > 0) {
            this.onStopTimer(btn);
            me.onStore('general.EscalaNacionalStore');
            extra	= {
                pdbTable: 'escala_nacional',
                pdbAll	: 0,
                where   : '{"estado":"1"}'
            };
            me.setParamStore('EscalaNacionalStore',extra);
            Ext.create('Admin.view.docentes.DesempenoView',{
                title   : 'Desempeños',
                records : select
            }).show();
        }else{
            me.onAler('Debe seleccionar al menos un estudiante...','error');
        }
    },

    onConfigSave : function (btn) {
        var win 	= btn.up('window'),
            grid 	= win.down('grid'),
            store 	= grid.getStore(),
            me		= this;
        modified = store.getModifiedRecords();
        if (!Ext.isEmpty(modified)) {
            store.sync({
                success: function(response){
                    grid.el.unmask();
                    var win1 	= Ext.ComponentQuery.query('notasacademicasdocentes')[0],
                        btn 	= win1.down('#btnSave');
                    me.setColumnGrid(btn);
                },
                failure: function (response) {
                    grid.el.unmask();
                    me.app.onAler('No se ha podido guardar los datos');
                }
            })
        }else{
            me.app.onAler('No hay cambios que guardar');
        }
    },

    /**
     *  Funcion que configura la interfaz para el llenado de notas
     *  en educación básica y media
     * @param btn
     * @constructor
     */

    onGetPrimaria : function (btn) {
        this.setColumnGrid(btn);
        var 
            form    = btn.up('form'),
            data    = form.down('#CbCarga').selection,
            sexo    = form.down('#sexo').getValue();
		ExExParams = {
			pdbGrado 	: data.get('id_grado'),
			pdbPeriodo	: Global.getPeriod(),
			pdbCurso 	: data.get('id'),
			pdbAsig 	: data.get('id_asig'),
			pdbGrupo	: data.get('grupo'),
			pdbJorn		: data.get('id_jorn'),
			pdbSexo     : sexo,
			pdbSede		: data.get('id_sede'),
			pdbMatric   : data.get('id_matric'),
			pdbTable	: '1'
		};

		Admin.getApplication().setParamStore('NotasStore',ExExParams);
		store = Ext.getStore('NotasStore');
		store.reload();
    },


	onRenderColorEscala : function (val) {
		var
			result = '';
		Ext.each(Global.getScale(),function (rec) {
			if(rec['nombre_escala'] == val){
				result = rec['color'];
			}
		});
		return '<span style="color:'+result+';"> <b>' + val + '</b></span>';
	},

    /**
     * Setea la visibilidad y los headers de las columnas del grid.
     * @param gridcolumns
     */
    setColumnGrid : function (btn) {
		var win 	= btn.up('form'),
            form	= win,
            grid	= null,
            btn1	= win.down('#btnSave'),
            btn2	= win.down('#btnUndo'),
            desde	= 0,
            hasta	= 0,
            me		= this,
			editor	= {
				xtype			: 'textfield',
				allowBlank		: false,
				selectOnFocus 	: true,
				emptyText		: '0',
				maskRe			: /[\d\.]/
			},
			grid = win.lookup('notasGrid');

		var
			columns	= [
				{
					xtype       : 'rownumberer'
				},
				{
					text		: 'ESTUDIANTES',
					dataIndex	: 'nombres',
					width		: 300,
					locked   	: true,
					menuDisabled: true,
					sortable    : true
				},
				{
					text		: 'P',
					dataIndex	: 'periodo',
					width		: 33,
                    locked   	: true,
                    tooltip     : 'Periodo académico',
					menuDisabled: true,
					sortable    : false
				}
			],
			finalColums	= {
				text        : 'FALTAS',
				defaults    : {
					width       : 45,
					align		: 'center',
					menuDisabled: true,
					sortable 	: true
				},
				columns : [
					{
						text 	    : 'J',
						dataIndex	: 'faltas',
						tooltip     : 'Ingrese las faltas Justifcadas',
						editor		: editor
					},
					{
						text 	    : 'I',
						dataIndex	: 'injustificadas',
						tooltip     : 'Ingrese las faltas Injustifcadas',
						editor		: editor
					},
					{
						text 	    : 'R',
						dataIndex	: 'retraso',
						tooltip     : 'Ingrese las faltas por llegada tarde a clase',
						editor		: editor
					}
				]
			};
		// Se agregan las columnas para las calificaciones númericas
		if (Global.getScale().length > 0){
			desde	= Global.getScale()[0].desde; // Nota minima
			hasta	= Global.getScale()[Global.getScale().length-1].hasta; // Nota maxima
			Ext.each(Global.getCompetences(),function (data) {
				columns.push({
					text		: data.competencia+' - '+data.porcentaje.toString()+' %',
					tooltip     : data.competencia+' - '+data.porcentaje.toString()+' %',
					defaults    : {
						width   	: 70,
						align		: 'right',
						menuDisabled: true,
						sortable 	: true
					},
					columns	: me.onEachColumsCompetencia(editor,data.id_pk)
				});
			});
		}
		columns.push({
				text 		: 'FINAL',
				dataIndex	: 'final',
				align		: 'right',
				width		: 80,
				menuDisabled: true,
				renderer :  function(val) {
					return '<span style="color:red;"> <b>' + val + '</b></span>'
				}
			},
			{
				text 		: 'Desempeño',
				width		: 100,
				menuDisabled: true,
				dataIndex	: 'nombre_escala',
				tooltip     : 'Escala de desempeño',
				renderer :  function(val) {
					return me.onRenderColorEscala(val);
				}
			},
			{
				text		: 'PROM',
				dataIndex	: 'prom',
				width		: 65,
				menuDisabled: true,
				sortable    : true,
				tooltip     : 'Promedio de notas'
			});
		columns.push(finalColums);
		grid = Ext.create('Admin.grid.CustomGrid', {
			reference	: 'notasGrid',
			itemId		: 'notasGrid',
			flex		: 1,
			loadmask 	: true,
            store		: 'NotasStore',
            cls         : 'email-inbox-panel shadow',
            autoLoad	: false,
			columnLines : true,
			selModel: {
				type            : 'spreadsheet',
				checkboxSelect  : true,
				extensible      : 'xy',
				columnSelect	: false,
				checkboxColumnIndex : 0,
				mode 			: 'MULTI'
			},
			plugins: [
				{
					ptype           : 'gridfilters'
				},
				{
					ptype			: 'cellediting',
					clicksToEdit	: 1,
					default         : 'textfield',
					triggerEvent    : 'cellclick',
					id              : 'CellEdit'
				},
				{
					ptype           : 'selectionreplicator'
				},
				{
					ptype           : 'clipboard'
				},
				{
					ptype			: 'gridSearch',
					readonlyIndexes	: ['note'],
					disableIndexes	: ['pctChange'],
					mode            : 'local',
					flex			: 1,
					autoFocus		: false,
					independent		: true
				}
			],
			multiColumnSort	: false,
			defaults		: {
				cellWrap 	: true
			},
			lockedGridConfig: {
                title       : 'Estudiantes',
				header      : false,
				collapsible : true,
                width       : 370,
                minWidth    : 290,
				forceFit    : true
			},
			columns		: columns,
			listeners :{
				validateedit : function (editor, e, eOpts ) {
					var
						vedit 	= (e.record.data[e.field]),
						valueo  = e.value,
						returns	= false;
					if (parseFloat(valueo)>parseFloat(hasta)) {
						returns = true;
					}
					fName	= e.field.toUpperCase();
					if ( (fName == 'FALTAS') || (fName == 'RETRASO') || (fName == 'INJUSTIFICADAS')) {
						returns = false;
					}
					if (returns==true) {
						e.cancel = true;
						e.record.data[e.field] = vedit;
						Admin.getApplication().showResult('Ha ingresado un valor incorrecto, el valor debe estar enter: '+
							desde+' hasta '+hasta);
					}else{
						if (vedit != valueo){
							btn.up('form').getController().onAutoSave(btn);
							btn1.setDisabled(false);
							btn2.setDisabled(false);
						}
					}
				},
				cellkeydown : function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
                    var
                        form    = grid.up('form'),
						grilla  = form.down('#notasGrid'),
						dIndex  = grilla.getColumns()[cellIndex].dataIndex;

                        form.getController().onStopTimer(btn);

					if ((cellIndex >= 0) && (dIndex != 'prom' || dIndex != 'nombres')) {
                        var 
                            campo 	= grid.grid.columns[cellIndex].dataIndex,
							btn1	= form.down('#btnSave'),
							btn2	= form.down('#btnUndo'),
							column  = grid.grid.columns[cellIndex],
						    xStore  = Ext.getStore('NotasStore'),
							xCountS = xStore.getCount() - 1;

						switch (e.getKey()) {
							case 46 :      // Si presionan la tecla DEL O SUP, se borra el dato.
								record.set(campo, 0);
								if (btn1.isDisabled()) {
									btn1.setDisabled(false);
								}
								if (btn2.isDisabled()) {
									btn2.setDisabled(false);
								}
								break;
							case 65 :		// Si presionan la letra A, reemplaza todos los valores
								aValue = record.get(campo);
								aStore = grid.getStore();
								aStore.each(function (rec) {
									rec.set(campo, aValue);        // Seteamos los valores de la columna
								});
								if (btn1.isDisabled()) {
									btn1.setDisabled(false);
								}
								if (btn2.isDisabled()) {
									btn2.setDisabled(false);
								}
								break;
							case 68 :	// Si presionan la letra D, se deshacen los ultimos cambios realizados
								btn1.click;
								break;
							case 67 :		// Si presionan la letra C, se calculan los datos
								btn3.click;
								break;
							case 71 :		// Si presionan la letra G, se guardan los datos
								btn2.click;
								break;
							case 38 : // Flecha arriba KeyUp
								if ((rowIndex - 1) >= 0) {
									var
										editor = grilla.getPlugin('CellEdit');
									grilla.setSelection(rowIndex - 1);
									editor.startEditByPosition({
										row		: rowIndex - 1,
										column	: cellIndex
									});
                                    editor.startEdit(rowIndex - 1, column);
								}
								break;
							case 40 : // Flecha abajo KeyDown
								if ((rowIndex + 1) <= xCountS) {
									var
										editor = grilla.getPlugin('CellEdit');
									grilla.setSelection(rowIndex + 1);
									editor.startEditByPosition({
										row     : rowIndex + 1,
										column  : cellIndex
									});
                                    editor.startEdit(rowIndex + 1, column);
								}
								break;
						}
					}
				},
				beforeedit : function (editor, e, eOpts){
					editor.editing = true;
				},
				cellclick : function ( grid) {
					var
						win		= grid.up('form'),
						btn 	= win.down('#btnSave'),
						btn1	= win.down('#btnUndo'),
						btn2	= win.down('#btnConfig'),
						btn3	= win.down('#btnCalcular'),
						btn4    = win.down('#menuNotes'),
						btn5    = win.down('#btnDesempen'),
						btn6    = win.down('#menuIndicadores');
					if (btn.isDisabled()) {
						btn.setDisabled(false);
					}
					if (btn1.isDisabled()) {
						btn1.setDisabled(false);
					}
					if (btn2.isDisabled()) {
						btn2.setDisabled(Global.getScale().length > 0);
					}
					if (btn3.isDisabled()) {
						btn3.setDisabled(!Global.getScale().length > 0);
					}
					if (btn4.isDisabled()) {
						btn4.setDisabled(false);
					}
					if (btn5.isDisabled()) {
						btn5.setDisabled(Global.getScale().length > 0);
					}
					if (btn6.isDisabled()) {
						btn6.setDisabled(false);
					}
				}
			},
			dockedItems : [
				{
					xtype   : 'pagination',
					store	: 'NotasStore'
				}
			]
		});
		form.remove('notasGrid',true);
		form.add(grid);
    },

    onEachColumsCompetencia : function (editor, idComp) {
		var
			colums	= [],
			store	= Ext.getStore('ColumnDocentesStore');
		store.each(function (data) {
			if ( data.get('id_competencia') == idComp){
				switch (data.get('nombre')){
					case 'PROM' :
						colums.push({
							text 	        : data.get('nombre'),
							width			: 77,
							dataIndex	    : data.get('name_column'),
							tooltip     	: data.get('descripcion'),
							hidden			: data.get('activa') > 0 ? false :  true,
							renderer :  function(val) {
								return '<span style="color:Darkviolet;"> <b>' + val + '</b></span>'
							}
						});
						break;
					case '%' :
						colums.push({
							text 	        : data.get('nombre'),
							dataIndex	    : data.get('name_column'),
							tooltip     	: data.get('descripcion'),
							hidden			: data.get('activa') > 0 ? false :  true,
							renderer :  function(val) {
								return '<span style="color:red;"> <b>' + val + '</b></span>'
							}
						});
						break;
					default :
						colums.push({
							text 	        : data.get('nombre'),
							dataIndex	    : data.get('name_column'),
							tooltip     	: data.get('descripcion'),
							hidden			: data.get('activa') > 0 ? false :  true,
							editor      	: editor
						});
						break;
				}
			}
		});
		return colums;
	},

    onDeleteLog : function (btn) {
       var  me      = this,
            record	= Ext.ComponentQuery.query('notasacademicasdocentes')[0].down('grid').getSelection()[0],
            app	    = this.app;
        extra = {
            pdbGrado 	: record.get('id_grado'),
            pdbAsig   	: record.get('id_asig'),
            pdbPeriodo  : record.get('periodo'),
            pdbNota   	: record.get('id'),
            pdbGrupo    : record.get('grupo'),
            pdbJorn  	: record.get('id_jorn')
        };
        app.setParamStore('LogrosNotasStore', extra);
        me.app.onGridDelete(btn);
    },

    onClickListLogros : function (btn) {
        var 
            me      = this,
            record	= btn.up('form').down('#CbCarga').getSelection();
        extra = {
            pdbGrado 	: record.get('id_grado'),
            pdbAsig   	: record.get('id_asig'),
            pdbPeriodo  : Global.getPeriod(),
            pdbGrupo    : record.get('grupo'),
            pdbJorn  	: record.get('id_jorn'),
            pdbSede   	: record.get('id_sede')
        };
        me.app.setParamStore('LogrosNotasEstudiantesStore', extra);
        Ext.create('Admin.view.docentes.LogrosNotasEstudiantesView').show();
    },

    onDeleteLogEstudiantes : function (btn) {
        var cbtn = btn,
            me	 = this;
        Ext.Msg.show({
            title	: 'Elimiar datos',
            message	: 'Desea eliminar el registro?',
            buttons	: Ext.Msg.YESNO,
            icon	: Ext.Msg.QUESTION,
            fn: function(btn) {
                if (btn === 'yes') {
                    var grid 	        = cbtn.up('grid'),
                        records         = grid.getSelectionModel().getSelection(),
                        recordsToSend   = [],
                        cUrl            = me.app.getUrlBase(),
                        store           = grid.getStore();
                    Ext.each(records, function(record) { //step 2
                            recordsToSend.push(Ext.apply({id:record.id},record.data));
                        }
                    );
                    recordsToSend = Ext.encode(recordsToSend);
                    grid.el.mask('Eliminando...');
                    Ext.Ajax.request({
                        url : cUrl+'c_logros/get_delete_logros_estudiantes_all',
                        params    : {
                            records	    : recordsToSend,
                            pdbGrado 	: records[0].get('id_grado')
                        },
                        success : function() {
                            store.remove(records);
                            store.commitChanges;
                            me.app.showResult('Se han eliminado los datos');
                        },
                        failure : function() {
                            me.app.showResult('No se han eliminado los datos');
                        },
                        callback : function(){
                            grid.el.unmask();
                        }
                    });
                }
            }
        });
    },

    onClickListSugerencias : function (btn) {
        var me      = this,
            record	 = btn.up('form').down('#CbCarga').getSelection();
        extra = {
            pdbGrado 	: record.get('id_grado'),
            pdbAsig   	: record.get('id_asig'),
            pdbPeriodo  : Global.getPeriod(),
            pdbGrupo    : record.get('grupo'),
            pdbJorn  	: record.get('id_jorn'),
            pdbSede   	: record.get('id_sede')
        };
        me.app.setParamStore('SugerenciasEstudiantesStore', extra);
        Ext.create('Admin.view.docentes.SugerenciasEstudiantesView').show();
    },

    onDeleteSugEstudiantes : function (btn) {
        var cbtn = btn,
            me	 = this,
            grado= Ext.ComponentQuery.query('notasacademicasdocentes')[0].down('#CbCarga').selection.get('id_grado');

        Ext.Msg.show({
            title	: 'Elimiar datos',
            message	: 'Desea eliminar el registro?',
            buttons	: Ext.Msg.YESNO,
            icon	: Ext.Msg.QUESTION,
            fn: function(btn) {
                if (btn === 'yes') {
                    var grid 	        = cbtn.up('grid'),
                        records         = grid.getSelectionModel().getSelection(),
                        recordsToSend   = [],
                        cUrl            = me.app.getUrlBase(),
                        store           = grid.getStore();

                    Ext.each(records, function(record) { //step 2
                            recordsToSend.push(Ext.apply({id:record.id},record.data));
                        }
                    );
                    recordsToSend = Ext.encode(recordsToSend);
                    grid.el.mask('Eliminando...');
                    Ext.Ajax.request({
                        url : cUrl+'c_sugerencias/get_delete_estudiantes',
                        params    : {
                            records  : recordsToSend,
                            pdbGrado 	: grado
                        },
                        success : function() {
                            store.remove(records);
                            store.commitChanges;
                            me.app.showResult('Se han eliminado los datos');
                        },
                        failure : function() {
                            me.app.showResult('No se han eliminado los datos');
                        },
                        callback : function(){
                            grid.el.unmask();
                        }
                    });
                }
            }
        });
    }
});
