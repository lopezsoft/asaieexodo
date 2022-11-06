/**
 * Created by LOPEZSOFT2 on 10/12/2016.
 */
Ext.define('Admin.view.configuraciones.controller.ConfiguracionesController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.configuraciones',

    init: function () {
        me = this;
        me.setConfigVar();
    },
    onCarnets : function(btn){
        var me  = this.app;
        me.onStore('general.CarnetsStore');
        Ext.create('Admin.view.configuraciones.Carnets').show();
    },
	onConfigMatOnline : function (btn) {
		var win     = btn.up('window'),
			me      = this.app,
			form    = win.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			store   = Ext.getStore('ConfigMatOnlineStore');
		record.set(values);
		store.sync({
			success : function(batch, o) {
				me.showResult('Se guardaron los datos correctamente.')
			},
			failure : function (e, r) {
				me.onError('Ocurrio un error, no se guardaron los cambios.');
			}
		});
	},

	onMatOnline : function (btn) {
        var me  = this.app;
        me.onStore('general.ConfigMatOnlineStore');
        store = Ext.getStore('ConfigMatOnlineStore');
        store.reload({
            callback : function (r, e) {
                if (r.length > 0){
                    //Habilitar matricula en línea
                    win     = Ext.create('Admin.view.configuraciones.ConfigMatOnlineView');
                    form    = win.down('form');
                    form.loadRecord(r[0]);
                    win.show();
                }else {
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

	onUpdateEscalaNacional : function (btn) {
		var win     = btn.up('window'),
			me      = this.app,
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbEscalaNacional'),
			values  = form.getValues();
		values.nombre_escala = cb.getSelection().get('nombre_escala');
		record.set(values);
		win.close();
	},

	onUpdateNivelCompetencia : function (btn) {
		var win     = btn.up('window'),
			me      = this.app,
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbGradosAgrupados'),
			values  = form.getValues();
		values.nombre_grado_agrupado = cb.getSelection().get('nombre_grado_agrupado');
		record.set(values);
		win.close();
	},

	onEscalaNacional    : function (btn) {
		var me  = this.app;
        me.onStore('general.EscalaNacionalStore');
        me.setParamStore('EscalaNacionalStore',{
            pdbTable: 'escala_nacional'
        });
        Ext.create('Admin.view.configuraciones.EscalaNacionalView').show();
	},

	onUpdateNivelEscala : function (btn) {
		var win     = btn.up('window'),
			me      = this.app,
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbGradosAgrupados'),
			values  = form.getValues();
		values.nombre_grado_agrupado = cb.getSelection().get('nombre_grado_agrupado');
		record.set(values);
		win.close();
	},

	onUpdateNivelGrado : function (btn) {
		var win     = btn.up('window'),
			me      = this.app,
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbNivelAcademico'),
			values  = form.getValues();
		values.nombre_nivel = cb.getSelection().get('nombre_nivel');
		record.set(values);
		win.close();
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

	onUpdateGradosPeriodos : function (btn) {
		var win     = btn.up('window'),
			me      = this.app,
			form    = win.down('form'),
			record  = form.getRecord(),
			cb		= win.down('CbGradosAgrupados'),
			values  = form.getValues();
		values.nombre_grado_agrupado = cb.getSelection().get('nombre_grado_agrupado');
		record.set(values);
		win.close();
	},

	onPeriodos : function (btn) {
		var me  = this.app;
			me.onStore('general.PeriodosStore');
			me.onStore('general.GradosAgrupadosStore');
			extra = {
				pdbTable: 'periodos_academicos',
				pdbType	: 1
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

    onSaveProyCupo : function (btn) {
        var win     = btn.up('window'),
            me      = this,
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            store   = Ext.getStore('ProyCuposStore');

        me.onDataSave(record, values, store, values, win,true);
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
        var me  = this.app,
            record  = null;
        record  = btn.up('window').down('grid').getSelection()[0];
        me.onStore('general.CriteriosAspectosObservadorStore');
        extra = {
            pdbTable    : 'obs_criterios',
            where       : '{"id_item_modelo": ' + record.get('id') + '}'
        };
        me.setParamStore('CriteriosAspectosObservadorStore',extra,false);
        win     = Ext.create('Admin.view.configuraciones.CriteriosAspectosObservadorView');
        win.setTitle('Criterios del aspecto: '+record.get('descripcion'));
        win.setRecord(record);
        win.show();
    },

    onAspectosObservador : function (btn) {
        var me  = this.app,
            record  = null;
        record  = btn.up('window').down('grid').getSelection()[0];
        me.onStore('general.AspectosObservadorStore');
        if (record.get('estado')==1){
            extra = {
                pdbTable    : 'obs_items_modelos',
                where       : '{"id_modelo": ' + record.get('id') + '}'
            };
            me.setParamStore('AspectosObservadorStore',extra,false);
            Ext.create('Admin.view.configuraciones.AspectosObservadorView',{
                record  : record
            }).show();
        }else{
            me.showResult('Elija un modelo activo');
        }
    },

    onEncabezadoObservador : function (btn) {
        var me  = this.app,
            record  = null;
            record  = btn.up('window').down('grid').getSelection()[0];
            me.onStore('general.EncabezadoObservadorStore');
            if (record.get('estado')==1){
                btn.up('window').mask();
                extra = {
                    pdbTable : 'obs_modelos_observador_cuerpo',
                    where    : '{"id_observador":'+record.get('id')+'}' 
                };
                me.setParamStore('EncabezadoObservadorStore',extra,false);
                store   = Ext.getStore('EncabezadoObservadorStore');
                store.reload({
                    callback : function (r, e) {
                        btn.up('window').unmask();
                        win     = Ext.create('Admin.view.configuraciones.EncabezadoObservadorView');
                        if (r.length > 0) {
                            form = win.down('form');
                            form.loadRecord(r[0]);
                        }
                        win.show();
                    }
                })
            }else{
                me.showResult('Elija un modelo activo');
            }
    },

    onModelosObservador : function (btn) {
        var me  = this.app;
            me.onStore('general.ModelosObservadorStore');
        Ext.create('Admin.view.configuraciones.ModelosObservadorView').show();
    },

    onCompetencias : function (btn) {
        var me  = this.app;
        me.onStore('general.GradosAgrupadosStore');
        me.onStore('general.DimensionesStore');
        ex = {
            pdbTable    : 'competencias',
            pdbType     : 1
        };
        me.setParamStore('DimensionesStore',ex,false);
        Ext.create('Admin.view.configuraciones.CompetenciasView').show();
    },

    onEscala    : function (btn) {
        var me  = this.app;
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
        var me  = this.app;
        me.onStore('general.ConfiguracionesStore');
        me.onStore('general.GradosAgrupadosStore');
        Ext.create('Admin.view.configuraciones.Configuraciones').show();
    }
});
