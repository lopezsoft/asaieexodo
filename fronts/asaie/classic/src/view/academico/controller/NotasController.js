/**
 * Created by LEWIS on 27/11/2015.
 */
Ext.define('Admin.view.academico.controller.NotasController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.Notas',
    init    : function() {
        this.setConfigVar();
        this.control({
        });
    },

	/**
	 * Funcion que se ejecuta cuando se pulsa el boton guardar
	 * en la vista de notas académicas
	 * @param btn
	 * @param e
	 * @param eOpts
	 * @constructor
	 */
	onClickTans	:  function(btn, e, eOpts) {
		let win 	= btn.up('window'),
			sel 	= win.down('grid').getSelection(),
			grid 	= win.down('grid'),
			store 	= grid.getStore(),
			id_matric = 0,
			me		= this.app;

		if(sel.length > 0){
			grid.mask('Transfiriendo notas...');
			let values = [];
			for (let cCount = 0; cCount < sel.length; cCount++) {
				const data = {
					id			: sel[cCount].get('id'),
					id_curso 	: sel[cCount].get('id_curso'),
					periodo		: sel[cCount].get('periodo')
				};
				id_matric	= sel[cCount].get('id_matric');
				Ext.Array.push(values, data);
			}
			const param = {
				pdbList : Ext.encode(values),
				pdbId	: id_matric,
				...Global.getSchoolParams()
			};

			Ext.Ajax.request({
				url		: Global.getApiUrl() + '/academic-notes/transfer-notes',
				params	: param,
				headers	: Global.getHeaders(),
				success: function () {
					store.reload();
					grid.unmask();
					me.showResult('Se han guardado los cambios.');
				},
				failure: function (response, opts) {
					me.onError('Error en el servidor, código del estado ' + response.status);
				},
				callback    : function (r, e) {
					grid.unmask();
				}
			});
		}else {
			me.onAler('No hay asginaturas marcadas para transferir.');
		}
	},


    /**
     * Funcion que se ejecuta caundo se pulsa el boton cerrar
     * de la Vista notas acadademicas
     * @param btn
     * @param e
     * @param eOpts
     * @constructor
     */
    onClickClose : function (btn, e, eOpts) {
        var win     = btn.up('window'),
            form	= win.down('form'),
            grid 	= win.down('grid'),
            me      = this;

        if (grid == null){
            form.getForm().reset();
            form.remove('grid1',true);
            win.close();
        }else{
            var	data    = grid.getSelection()[0];
            if (!Ext.isEmpty(data)) {

                var	store 	= grid.getStore(),
                    me		= this,
                    cbtn	= btn,
                    ce		= e,
                    ceOpts	= eOpts,
                    data    = grid.getSelection()[0],
                    cGrado	= data.get('id_grado');
				modified = store.getModifiedRecords();
				
                if(Ext.isEmpty(modified)) {
                    form.getForm().reset();
                    form.remove('grid1',true);
                    win.close();
                }else{

                    Ext.Msg.show({
                        title: 'S.M.E. ...Guardar datos',
                        message: 'Se han modificado datos, desea guardarlos?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        fn: function(btn) {
                            if (btn === 'yes') {
                                if (cGrado >='01' && cGrado<='11'){
                                    me.onClickCalcular(cbtn, ce, ceOpts);
                                }
                                grid.el.mask('Guardando…', 'x-mask-loading');
                                store.sync({
                                    success: function(batch) {
                                        grid.el.unmask();
                                        me.app.showResult('Se han guardado los datos correctamente');
                                    },
                                    failure : function (batch) {
                                        grid.el.unmask();
                                        me.app.showResult('No se ha podido guardar los datos');
                                    },

                                    callback : function (batch) {
                                        form.getForm().reset();
                                        form.remove('grid1',true);

                                        win.close();
                                    }
                                });

                            }else{
                                store.rejectChanges();
                                form.getForm().reset();
                                form.remove('grid1',true);
                                win.close();
                            }
                        }
                    });
                }
            }else{
                form.getForm().reset();
                form.remove('grid1',true);
                win.close();
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

    onViewData : function	(btn, e) {
        var	me 		= this,
            win		= btn.up('window'),
            cPeriodo= win.down('#periodo').selection.get('periodo');
        	Global.setPeriod(cPeriodo);
        if(Global.getScale().length > 0){  // Primaria, secundaria y media
            me.onGetPrimaria(btn,e);
        }else{
			me.app.onAler('Esta opción no está habilitada para preescolar');
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

    onClickGridNotas : function (grid, record, item, index, e, eOpts ) {

        var win		= grid.up('window'),
            btn3	= win.down('#btnCalcular'),
            btn4	= win.down('#btnNotes'),
            btn5	= win.down('#btnConfig'),
            btn6	= win.down('#btnDesempen'),
            data    = Ext.ComponentQuery.query('NotasAcademicasView')[0].getSelection()[0],
            me		= this;

        cGrado 	= data.get('cod_grado');

        if (cGrado >= '01')	{

            if (btn3.isDisabled()) {
                btn3.setDisabled(false);
            }

            if (btn4.isDisabled()) {
                btn4.setDisabled(false);
            }

            if (btn5.isDisabled()) {
                btn5.setDisabled(false);
            }

        }else{

            if (!btn5.isHidden()) {
                btn5.setHidden(true);
            }

            if (!btn3.isHidden()) {
                btn3.setHidden(true);
            }

            if (btn6.isHidden()) {
                btn6.setHidden(false);
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
        var win 	= btn.up('window'),
            grid 	= win.down('grid'),
            store 	= grid.getStore(),
            me		= this,
            btn1	= win.down('#btnSave'),
            btn2	= win.down('#btnUndo');

        // Obtiene los campos modificados
        modified = store.getModifiedRecords();

        // Si hay campos modificados los guarda
        if(!Ext.isEmpty(modified)){
            grid.el.mask('Guardando…', 'x-mask-loading');
            store.sync({
                success: function(batch) {
                    grid.el.unmask();
                    me.app.showResult('Se han guardado los datos correctamente');
                    store.reload();
                },
                failure : function (batch) {
                    grid.el.unmask();
                    me.app.showResult('No se ha podido guardar los datos');
                }
            });

        }else{
            btn1.setDisabled(true);

            btn2.setDisabled(true);
            me.app.showResult('No hay cambios que guardar');
        }
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

        var win 	= btn.up('window'),
            grid 	= win.down('grid'),
            aStore 	= grid.getStore(),
            btn1	= win.down('#btnSave'),
            btn2	= win.down('#btnUndo'),
            me		= this,
            x		= 0,
			nFinal	= 0,
			aDesempeño,
			escala	= '',
			dbConfig= Global.getDbConfig(),
			hasta	= 0,
			_n_red	= 0,
			_n_final_red	= 0,
			_n_aplica		= 0;


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
			colPorc	= '';

		Ext.each(Global.getColumnsNotes(),function (data) {
			if (data.id_competencia === idComp){
				switch (data.tipo){
					case 'NOTA' :
						nota	=  parseFloat(record.get(data.name_column));
						porNota	= parseFloat(record.get(data.porciento));
						if (nota > 0){
							if(porNota > 0){
								sumaPor = sumaPor + (nota * porNota / 100);
								porcient= porcient + porNota;
							}else {
								notaSuma = notaSuma + nota;
								contNota = ++contNota;
							};
							suma = suma + nota;
							cont = ++cont;
						}
						break;
					case 'PROM' :
						colProm	= data.name_column;
						break;
					case 'PORC' :
						colPorc	= data.name_column;
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
     * Funcion que abre la vista para configurar las columnas de la grilla
     * @param btn
     * @param e
     * @param eOpts
     */

    onViewConfig : function	(btn, e, eOpts) {
        var win 	= null,
            me      = this.app;
        me.onMsgWait();
        win	= me.getWindow('','Admin.view.docentes.ConfigColumnView');
        win.show();
        me.onMsgClose();
    },

    onConfigSave : function (btn, e, eOpts) {
        var win 	= btn.up('window'),
            grid 	= win.down('grid'),
            store 	= grid.getStore(),
            me		= this;
        modified = store.getModifiedRecords();

        if (!Ext.isEmpty(modified)) {
            store.sync({
                success: function(response){
                    grid.el.unmask();
                    var win1 	= Ext.ComponentQuery.query('NotasView')[0],
                        grid1 	= win1.down('#grid1'),
                        gridColumn	= grid1.columns;
                    me.setColumnGrid(gridColumn);
                },
                failure: function (response) {
                    grid.el.unmask();
                    me.pp.onAler('No se ha podido guardar los datos');
                }
            })
        }else{
            me.pp.onAler('No hay cambios que guardar');
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

    /**
     *  Funcion que configura la interfaz para el llenado de notas
     *  en educación básica y media
     * @param btn
     * @constructor
     */

    onGetPrimaria : function (btn, e) {
        var win 	= e,
            form	= win.down('form'),
            grid	= null,
            btn1	= win.down('#btnSave'),
            btn2	= win.down('#btnUndo'),
            btn4	= win.down('#btnNotes'),
            cDesde	= 0,
            cHasta	= 0,
            me		= this,
			scale 	= Global.getScale(),
			competences	= Global.getCompetences(),
            data    = btn.up('window').down('grid').getSelection()[0],
            defaultEditor   = {
                allowBlank		: false,
                selectOnFocus 	: true,
                emptyText		: '00.00',
                maskRe			: /[\d\.]/
            },
			editor	= {
				xtype			: 'textfield',
				allowBlank		: false,
				selectOnFocus 	: true,
				emptyText		: '0',
				maskRe			: /[\d\.]/
			},
			grid = win.lookup('notasGrid');

        cDesde	= scale[0].desde; // Nota minima
        cHasta	= scale[scale.length-1].hasta; // Nota maxima
		var
			columns	= [
				{
					xtype: 'customrownumberer'
				},
				{
					text		: 'Asignaturas',
					dataIndex	: 'asignatura',
					width		: 205,
					locked   	: true,
					menuDisabled: true,
					sortable    : false
				},
				{
					text		: 'Prom',
					dataIndex	: 'prom',
					width		: 55,
					locked   	: true,
					menuDisabled: true,
					sortable    : false
				},
				{
					text		: 'PER',
					dataIndex	: 'periodo',
					width		: 45,
					locked   	: true,
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
		Ext.each(competences,function (data) {
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
			});
		columns.push(finalColums);
		grid = Ext.create('Ext.grid.Panel', {
			reference	: 'notasGrid',
			itemId		: 'notasGrid',
			flex		: 1,
			loadmask 	: true,
			store		: 'NotasAcademicasStore',
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
					triggerEvent    : 'cellclick'
				},
				{
					ptype           : 'selectionreplicator'
				},
				{
					ptype           : 'clipboard'
				}
			],
			multiColumnSort	: false,
			defaults		: {
				cellWrap 	: true
			},
			lockedGridConfig: {
				header      : false,
				collapsible : true,
				width       : 370,
				forceFit    : true
			},
			columns		: columns,
			listeners	:
				{

					'validateedit' : function (editor, e, eOpts ) {
						var
							vedit 	= (e.record.data[e.field]),
							valueo		= e.value,
							returns	= false;

						if (parseFloat(valueo)>parseFloat(cHasta)) {
							returns = true;
						}

						fNaem	= e.field.toUpperCase();

						if ( (fNaem == 'FALTAS') || (fNaem == 'RETRASO') || (fNaem == 'INJUSTIFICADAS')) {
							returns = false;
						}

						if (returns==true) {
							e.cancel = true;
							e.record.data[e.field] = vedit;
							Admin.getApplication().showResult('Ha ingresado un valor incorrecto, el valor debe estar enter: '+
								cDesde+' hasta '+cHasta);
							// Ext.MessageBox.alert();
						}else{

							btn1.setDisabled(false);
							btn2.setDisabled(false);
						}
					},

					cellkeydown : function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
						var campo 	= grid.grid.columns[cellIndex].dataIndex,
							aIndex 	= -1,
							win		= grid.up('window'),
							btn1	= win.down('#btnSave'),
							btn2	= win.down('#btnUndo');

						switch(e.getKey()){
							case 46 :      // Si presionan la tecla DEL O SUP, se borra el dato.
								record.set(campo,0);
								if (btn1.isDisabled()) {
									btn1.setDisabled(false);
								}
								if (btn2.isDisabled()) {
									btn2.setDisabled(false);
								}
								break;
							case 65 :		// Si presionan la letra A, reemplaza todos los valores
								aValue 	= record.get(campo);
								aStore 	= grid.getStore();
								Ext.each(aStore.data, function() {
										aIndex = aIndex+1;
										aRecord	= aStore.getAt(aIndex) ; // obtenesmos el registros
										aRecord.set(campo, aValue);        // Seteamos los valores de la columna
									}
								);
								if (btn1.isDisabled()) {
									btn1.setDisabled(false);
								}
								if (btn2.isDisabled()) {
									btn2.setDisabled(false);
								}
								break;
							case 40 : // Flecha abajo KeyDown

								grid.setSelection(rowIndex+1);

								break;
						}

					},

					beforeedit : function (editor, e, eOpts){
						e.grid.focus(true, true);
					},

					cellclick : function ( grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {

						win		= grid.up('window'),
							btn 	= win.down('#btnSave'),
							btn1	= win.down('#btnUndo'),
							btn3	= win.down('#btnCalcular'),
							btn4    = win.down('#btnList');

						if (btn.isDisabled()) {
							btn.setDisabled(false);
						}

						if (btn1.isDisabled()) {
							btn1.setDisabled(false);
						}

						if (btn3.isDisabled()) {
							btn3.setDisabled(false);
						}
					}
				},
			dockedItems : [
				{
					xtype   : 'pagination'
				}
			]
		});
		form.remove('notasGrid',true);
		form.add(grid);
        ExExParams = {
            pdbCodGrado : data.get('id_grade'),
            pdbPeriodo	: Global.getPeriod(),
            pdbMatric   : data.get('id'),	
            pdbTable	: '1'
        };

        me.app.setParamStore('NotasAcademicasStore',ExExParams,true);
    },

	onEachColumsCompetencia : function (editor, idComp) {
    	var
			colums 		= [],
			colNotes	= Global.getColumnsNotes(),
			x = 0;
		Ext.each(colNotes, function (data) {
			if (data.id_competencia === idComp){
				x	= ++x;
				switch (data.tipo){
					case 'NOTA' :
						colums.push({
							text 	        : '#'+x.toString(),
							dataIndex	    : data.name_column,
							tooltip     	: 'Nota académica',
							editor      	: editor
						});
						break;
					case 'PROM' :
						colums.push({
							text 	        : 'Prom',
							width			: 75,
							dataIndex	    : data.name_column,
							tooltip     	: 'Promedio de notas',
							renderer :  function(val) {
								return '<span style="color:Darkviolet;"> <b>' + val + '</b></span>'
							}
						});
						break;
					case 'PORC' :
						colums.push({
							text 	        : '%',
							dataIndex	    : data.name_column,
							tooltip     	: 'Porcentaje',
							renderer :  function(val) {
								return '<span style="color:red;"> <b>' + val + '</b></span>'
							}
						});
						break;
				}
			}
		});
		return colums;
	},

	onRenderColorEscala : function (val) {
    	var
			result = '';
		switch(val){
			case 'BAJO':
				result = '<span style="color:red;"> <b>' + val + '</b></span>';
				break;
			case 'BÁSICO':
				result =  '<span style="color:green;"> <b>' + val + '</b></span>';
				break;
			case 'ALTO':
				result =  '<span style="color:Darkviolet;"> <b>' + val + '</b></span>';
				break;
			case 'SUPERIOR':
				result =  '<span style="color:Steelblue;"> <b>' + val + '</b></span>';
				break;
		}
		return result;
	}
});
