Ext.define('Admin.view.docentes.controller.ObservadorController', {
    extend 	: 'Admin.base.BaseController',
	alias	:'controller.observador',
    init : function () {
		me  = this;
		me.setConfigVar();
	},

	onSaveCriterios	: function (btn) {
		var win 	= btn.up('window'),
			grid 	= win.down('grid'),
			store 	= grid.getStore(),
			me		= this;
		// Obtiene los campos modificados
		modified = store.getModifiedRecords();
		// Si hay campos modificados los guarda
		if(!Ext.isEmpty(modified)){
			grid.el.mask('Guardando…', 'x-mask-loading');
			store.sync({
				success: function(batch) {
					grid.el.unmask();
					me.app.showResult('Se han guardado los datos correctamente');
				},
				failure : function (batch) {
					grid.el.unmask();
					me.app.showResult('No se han podido guardar los datos');
				}
			});
		}else{
			me.app.showResult('No hay cambios que guardar');
		}
	},

	onClickCrudObservador : function (btn) {
		let me = this.app,
			form = btn.up('form'),
			grid = form.down('grid'),
			tipo = 3,
			data = grid.getSelection()[0],
			msg = 'Usted no es director de grupo y tampoco posee permisos para diligenciar la ficha.';
		form.mask('Verificando permisos...');
		Ext.Ajax.request({
			url		: Global.getApiUrl() +  '/competence/competences',
			params	: {
				pdbGrado 	: data.get('id_grade'),
				...Global.getSchoolParams()
			},
			headers: Global.getHeaders(),
			success: function(response) {
				const responseData = Ext.decode(response.responseText);
				tipo = responseData.observerModule ? parseFloat(responseData.observerModule.id) : 3;

				let table = '';
				switch(tipo){
					case 1 :
						table = 'obs_observador_mod_1';
						break;
					case 2 :
						table = 'obs_observador_mod2';
						break;
					case 3 :
						table = 'obs_observador_mod_3';
						break;
					case 4 :
						table = 'obs_observador_mod_1';
						break;
					case 5 :
						table = 'obs_observer_mod_5';
						break;
					default :
						table = 'obs_observador_mod_1';
						break;
				}

				const extParam = {
					pdbGrado 	: data.get('id_grade'),
					pdbGrupo	: data.get('id_group'),
					pdbSede 	: data.get('id_headquarters'),
					pdbJorn  	: data.get('id_study_day'),
					pdbId		: data.get('id'),
					typeObserver: tipo,
					pdbTable	: table
				};
				data.set('typeObserver', tipo);
				me.setParamStore('ObservadorStore',extParam);

				// 1. Desestructuración de objetos y eliminación de llamadas redundantes
				const { generalSetting, groupDirectors } = responseData;

				// 2. Configuración de variables globales (si Global es un singleton necesario)
				Global.setDbConfig(generalSetting);
				Global.setGroupDirectors(groupDirectors);

				// Función auxiliar para crear y mostrar la vista, evitando repetición
				const showCrudObservadorView = () => {
					Ext.create('Admin.view.docentes.observador.CrudObserverView', {
						title: 'Fichas de seguimiento: ' + data.get('nombres'),
						record: data
					}).show();
				};

				// 3. Conversión explícita a booleano para mayor claridad
				const showTeacherObsForm = parseInt(generalSetting.docente_ficha_obs, 10) === 1;

				if (showTeacherObsForm) {
					showCrudObservadorView();
				} else if (groupDirectors.length === 0) {
					me.showResult(msg);
				} else {
					// 4. Usar Array.prototype.some para una búsqueda más idiomática y sin variables globales
					const hasAccess = groupDirectors.some(rec => {
						// 5. Usar comparaciones estrictas (===)
						return (rec.id_grado === data.get('id_grade')) &&
							(rec.grupo === data.get('id_group')) &&
							(rec.id_jorn === data.get('id_study_day'));
					});

					if (hasAccess) {
						showCrudObservadorView();
					} else {
						me.showResult(msg);
					}
				}
			},
			failure: function(response) {
				me.onError('server-side failure with status code ' + response.status);
			},callback	: function () {
				form.unmask();
			}
		});
	},

	// Fortalezas y dificultades modelo del observador 
	onFortDif : function (btn) {
		const app = this.app,
			win = btn.up('window'),
			tipo = '3',
			grid = win.down('grid'),
			data = grid.getSelection()[0];
		app.onStore('docentes.observador.ItemsModelo3Store');
		switch(tipo){
			case '1' :
				view 	= 'Admin.view.docentes.observador.CrudFortDifView';
				title	= 'Fortalezas o dificultades';
				table	= 'obs_items_modelo_1';
				break;
			case '2' :
				view 	= 'Admin.view.docentes.observador.CrudFortDifView';
				title	= 'Fortalezas o dificultades';
				table	= 'obs_items_modelo_1';
				break;
			case '3' :
				view 	= 'Admin.view.docentes.observador.ItemsModelo3View';
				title	= 'Aspectos y criterios';
				table	= 'obs_items_modelo_3';
				break;
			case '4' :
				view 	= 'Admin.view.docentes.observador.CrudFortDifView';
				title	= 'Fortalezas o dificultades';
				table	= 'obs_items_modelo_1';
				break;
			default :
				view 	= 'Admin.view.docentes.observador.CrudFortDifView';
				title	= 'Fortalezas o dificultades';
				table	= 'obs_items_modelo_1';
				break;
		}
		const extParam = {
			pdbObserverId  	: data.get('id'),
			pdbSede			: data.get('id_headquarters'),
			pdbTable		: table
		};
		app.onStore('docentes.observador.FortDifStore');
		app.setParamStore('FortDifStore',extParam);
		app.setParamStore('ItemsModelo3Store',extParam);
		Ext.create(view,{
			title	: title,
			record	: data
		}).show();
	},

	onCrudFortDif : function (btn, e, eOpts) {
		var app 	= this.app,
			win 	= btn.up('window'),
			grid 	= win.down('grid'),
			win		= null;
	 		app.onStore('docentes.observador.ModelosStore');
		oData	= grid.getSelection();
		nCount 	= grid.getStore().getCount();
		view 	= 'Admin.view.docentes.observador.FoftDifView';
		title	= 'Fortalezas o dificultades';
		switch(btn.itemId){
			case 'addButton':
				win = app.getWindow('Nuevo - '+title,view);
				break;
			default:
				win 	= app.getWindow('Edición - '+title,view);
				form	= win.down('form');
				form.loadRecord(oData[0]);
				break;
			}
		win.show();
	},
	// Guardamos los datos de las fortalez o dificultades del observador
	onSaveFortDif : function (btn, e, eOpts) {
		var me = this;
	 	var win 	= btn.up('window'),	 	
	 		form 	= win.down('form'),	 		 	
	 		values 	= form.getValues(),
	 		record 	= form.getRecord(),
	 		store 	= Ext.getStore('FortDifStore');
		var data = {
			tipo				:  values.tipo,
			descripcion			:  values.descripcion
		};
		me.onDataSave(record,values,store,data,win);
	},

	onAnotaciones	: function (btn) {
		const me = this.app,
			grid = btn.up('window').down('grid'),
			data = grid.getSelection()[0];

		let extraParams = {
			pdbTable: 'periodos_academicos',
			pdbGrado: data.get('id_grade'),
			pdbType: 0
		};
		let extParam = {
			where: '{"id_observador" : ' + data.get('id') + '}',
			pdbTable: 'obs_anotaciones_mod_3'
		};
		me.onStore('docentes.observador.AnotacionesM3Store');
		me.setParamStore('AnotacionesM3Store',extParam);
		me.setParamStore('PeriodosStore',extraParams,true);
		Ext.create('Admin.view.docentes.observador.CrudAnotacionesM3View',{
			title	: 'Anotaciones',
			record	: data
		}).show();
	},

	/**
	 * Funcion para setear los datos que se enviar al servidor para lamar el reporte.
	 * @param btn
	 */
	onSetReport: function(btn){
		let param;
		let url = '',
			win = btn.up('window'),
			name = win.getItemId();
		switch (name){
			case 'CrudObservadorView' :
				url = 'reports/observer-sheet';
				let values = win.down('grid').getSelection()[0];
				param = {
					pdbGrado: values.get('id_grade'),
					pdbGrupo: values.get('id_group'),
					pdbJorn: values.get('id_study_day'),
					pdbMatric: values.get('id_matric'),
					pdbSede: values.get('id_headquarters'),
					pdbEstudian: values.get('nombres')
				};
				break;
			case 'EstudiantesView' :
				url = 'reports/report_ficha_observador';
				values = win.down('grid').getSelection()[0];
				param = {
					pdbGrado: values.get('id_grado'),
					pdbGrupo: values.get('grupo'),
					pdbJorn: values.get('id_jorn'),
					pdbMatric: values.get('id_matric'),
					pdbSede: values.get('id_sede'),
					pdbEstudian: values.get('nombres')
				};
				break;
		}

		this.onGenReport(btn,url,param);
	}
});

