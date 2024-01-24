/**
 * Created by LOPEZSOFT2 on 10/12/2016.
 */
Ext.define('Admin.view.configuraciones.controller.ConfiguracionesController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.configuraciones',
    init: function () {
        this.setConfigVar();
    },
	onExtraModules : function () {
		const me = this.app;
		me.onStore('general.ExtraModulesStore');
		Ext.create('Admin.view.configuraciones.ExtraModulesView').show();
	},
	onWatermark : function () {
		const me = this.app;
		me.onStore('general.WatermarkStore');
		Ext.create('Admin.view.configuraciones.WatermarkView').show();
	},
    onCarnets : function(){
		const me = this.app;
		me.onStore('general.CarnetsStore');
        Ext.create('Admin.view.configuraciones.Carnets').show();
    },
	onImportCriteria : function(uBtn){
		let me  	= this;
		Ext.Msg.show({
			title: 'Importar criterios',
			message: '¿Seguro que desea importar los criterios del ultimo año?',
			buttons: Ext.Msg.YESNO,
			icon: Ext.Msg.QUESTION,
			fn: function(btn) {
				if (btn === 'yes') {
					const cUrl	= Global.getApiUrl() +'/observer/import';
					const vMask = uBtn.up('window');
					vMask.el.mask('Importando datos');
					Ext.Ajax.request({
						timeout : 0,
						url: cUrl,
						method: 'POST',
						params: {
							...Global.getSchoolParams()
						},
						headers: Global.getHeaders(),
						success: function () {
							vMask.el.unmask();
							me.showResult('Datos importados correctamente');
							const store = Ext.getStore('AspectosObservadorStore');
							store.reload();
						},
						failure: function (response) {
							vMask.el.unmask();
							let result = Ext.decode(response.responseText);
							me.app.onError(result.message || 'No se pueden cargar los datos');
						},
						callback : function () {
							vMask.el.unmask();
						}
					});
				}
			}
		});
	},

	onMatOnline : function (btn) {
        var me  = this.app;
        me.onStore('general.ConfigMatOnlineStore');
        store = Ext.getStore('ConfigMatOnlineStore');
        store.reload({
            callback : function (r, e) {
				let win;
				if (r.length > 0) {
					//Habilitar matricula en línea
					win = Ext.create('Admin.view.configuraciones.ConfigMatOnlineView');
					form = win.down('form');
					form.loadRecord(r[0]);
					win.show();
				} else {
					me.onError('Ha ocurrido un error');
				}
            }
        });
	},

	onJornadas    : function (btn) {
		var me  = this.app;
        me.onStore('general.JornadasStore');
        Ext.create('Admin.view.configuraciones.JornadasView').show();
	},
	onEscalaNacional    : function (btn) {
		var me  = this.app;
        me.onStore('general.EscalaNacionalStore');
        me.setParamStore('EscalaNacionalStore',{
            pdbTable: 'escala_nacional'
        });
        Ext.create('Admin.view.configuraciones.EscalaNacionalView').show();
	},

	onGrados : function (btn) {
		var me  = this.app;
        me.onStore('general.GradosStore');
        Ext.create('Admin.view.configuraciones.GradosAcademicosView').show();
	},

	onUpdateGradosAcademicosIn : function (btn) {
		var me  	= this.app,
			win		= btn.up('window'),
			grid	= win.down('grid'),
			store	= Ext.getStore('AuxGradosAgrupadosStore'),
			select	= grid.getSelection(),
			param	= me.getParamStore('AuxGradosAgrupadosStore'),
			x		= 0;
		for (x = 0; x < select.length; x++) {
			var
				data	= select[x];
			store.insert(0,
				{
					id_grado_agrupado 	: param.pdbIdGradoAgrupado,
					id_grado			: data.get('id')
				}
			);
		}
		store.sync({
			callback : function (req, res) {
				store.reload();
			}
		});
		win.close();
	},

	onNivelesAcademicos : function (btn) {
		var me  = this.app;
        me.onStore('general.NivelesAcademicosStore');
        Ext.create('Admin.view.configuraciones.NivelesAcademicosView').show();
	},

	onGradosAgrupados : function (btn) {
		var me  = this.app;
        me.onStore('general.GradosAgrupadosStore');
        Ext.create('Admin.view.configuraciones.GradosAgrupadosView').show();
	},

	onPeriodos : function (btn) {
		const me = this.app;
		me.onStore('general.PeriodosStore');
			me.onStore('general.GradosAgrupadosStore');
		let extra = {
			pdbTable: 'periodos_academicos',
			pdbType: 1
		};
			me.setParamStore('PeriodosStore', extra, true);
			Ext.create('Admin.view.configuraciones.PeriodosView').show();
	},

	onFirmas : function (btn) {
		var me  = this.app;
        me.onStore('general.FirmasStore');
        store = Ext.getStore('FirmasStore');
        store.reload({
            callback : function (r, e) {
                if (r.length > 0){
                    win     = Ext.create('Admin.view.configuraciones.FirmasView');
                    form    = win.down('form');
                    form.loadRecord(r[0]);
                    win.show();
                }else {
                    me.onError('Ha ocurrido un error');
                }
            }
        });
	},

    onNewProyCupos : function (btn) {
        var me  = this.app;
        win     = Ext.create('Admin.view.configuraciones.SaveProyCuposView');
        if (btn.itemId == 'editButton'){
            form    = win.down('form');
            record  = btn.up('window').down('grid').getSelection()[0];
            form.loadRecord(record);
            win.show();
        }else{
            win.show();
        }
    },

    onProyCupos : function (btn) {
        var me  = this.app;
        me.onStore('general.ProyCuposStore');
        me.onStore('general.GradosStore');
        me.onStore('general.SedesStore');
        Ext.create('Admin.view.configuraciones.ProyCupos').show();
    },

    onEncabezado : function (btn) {
        var me  = this.app,
            ts  = this;
        me.onStore('general.EncabezadoReportesStore');
		let store = Ext.getStore('EncabezadoReportesStore');
        ts.mask();
        store.reload({
            callback : function (r, e) {
                ts.unmask();
				let win;
				let form;
				if (r.length > 0) {
					win = Ext.create('Admin.view.configuraciones.EncabezadoReportesView');
					form = win.down('form');
					form.loadRecord(r[0]);
					win.show();
				} else {
					me.onError('Ha ocurrido un error');
				}
            }
        });
    },

    onEstado : function (btn) {
        var me  = this.app;
        me.onStore('general.EstadoFinalStore');
        Ext.create('Admin.view.configuraciones.EstadoFinalView').show();
    },
    onDiplomas : function (btn) {

    },
    onBoletines : function (btn) {
        var me  = this.app;
        me.onStore('general.ConfiguracionBoletinStore');
        store = Ext.getStore('ConfiguracionBoletinStore');
        store.reload({
            callback : function (r, e) {
                if (r.length > 0){
                    win     = Ext.create('Admin.view.configuraciones.ConfiguraBoletinView');
                    form    = win.down('form');
                    form.loadRecord(r[0]);
                    win.show();
                }else {
                    me.onError('Ha ocurrido un error');
                }
            }
        });
    },

    onCriterios : function (btn) {
		let me = this.app,
			record = null;
		record  = btn.up('window').down('grid').getSelection()[0];
        me.onStore('general.CriteriosAspectosObservadorStore');
		let extra = {
			pdbTable: 'obs_criterios',
			where: '{"id_item_modelo": ' + record.get('id') + '}'
		};
        me.setParamStore('CriteriosAspectosObservadorStore',extra,false);
		let win = Ext.create('Admin.view.configuraciones.CriteriosAspectosObservadorView');
        win.setTitle('Criterios del aspecto: '+record.get('descripcion'));
        win.setRecord(record);
        win.show();
    },

    onAspectosObservador : function (btn) {
		let me = this.app,
			record = null;
		record  = btn.up('window').down('grid').getSelection()[0];
        me.onStore('general.AspectosObservadorStore');
		let extra;
		if (record.get('estado') == 1) {
			extra = {
				pdbTable: 'obs_items_modelos',
				where: '{"id_modelo": ' + record.get('id') + ', "year": ' + Global.getSchoolParams().year + '}'
			};
			me.setParamStore('AspectosObservadorStore', extra, false);
			Ext.create('Admin.view.configuraciones.AspectosObservadorView', {
				record: record
			}).show();
		} else {
			me.showResult('Elija un modelo activo');
		}
    },

    onEncabezadoObservador : function (btn) {
		let me = this.app,
			record = null;
		record  = btn.up('window').down('grid').getSelection()[0];
            me.onStore('general.EncabezadoObservadorStore');
		let extra;
		if (record.get('estado') == 1) {
			btn.up('window').mask();
			extra = {
				pdbTable: 'obs_modelos_observador_cuerpo',
				where: '{"id_observador":' + record.get('id') + '}'
			};
			me.setParamStore('EncabezadoObservadorStore', extra, false);
			store = Ext.getStore('EncabezadoObservadorStore');
			store.reload({
				callback: function (r, e) {
					btn.up('window').unmask();
					let win = Ext.create('Admin.view.configuraciones.EncabezadoObservadorView');
					if (r.length > 0) {
						form = win.down('form');
						form.loadRecord(r[0]);
					}
					win.show();
				}
			})
		} else {
			me.showResult('Elija un modelo activo');
		}
    },

    onModelosObservador : function (btn) {
        var me  = this.app;
            me.onStore('general.ModelosObservadorStore');
        Ext.create('Admin.view.configuraciones.ModelosObservadorView').show();
    },

    onCompetencias : function (btn) {
		const me = this.app;
		me.onStore('general.GradosAgrupadosStore');
        me.onStore('general.DimensionesStore');
		let ex = {
			pdbTable: 'competencias',
			pdbType: 1
		};
        me.setParamStore('DimensionesStore',ex,false);
        Ext.create('Admin.view.configuraciones.CompetenciasView').show();
    },

    onEscala    : function (btn) {
		const me = this.app;
		me.onStore('general.EscalaStore');
			me.onStore('general.GradosAgrupadosStore');
            me.onStore('general.EscalaNacionalStore');
            me.setParamStore('EscalaNacionalStore',{
                pdbTable    : 'escala_nacional',
                where       : '{"estado": 1}'
            });
            Ext.create('Admin.view.configuraciones.EscalaView').show();
    },
    onGeneral : function (btn) {
		const me = this.app;
		me.onStore('general.ConfiguracionesStore');
        me.onStore('general.GradosAgrupadosStore');
        Ext.create('Admin.view.configuraciones.Configuraciones').show();
    }
});
