Ext.define('Admin.view.promocion.controller.PromocionController', {
    extend: 'Admin.base.BaseController',
    alias: 'controller.Promocion',
    init: function() {
        me = this;
        me.setConfigVar();
    },

    onCreateStores: function() {
        var me = Admin.getApplication().onCreateStores();
    },

    onHistorilaAca: function(btn) {
        var
            me = this.app;
        Ext.require([
            'Admin.view.promocion.HistorialAcademicoView'
        ]);

        Ext.onReady(function() {
            me.onStore('general.GradosStore');

			let win = me.getWindow('Historial académico', 'Admin.view.promocion.HistorialAcademicoView');
            win.show();
        });
    },

    onSaveActaGradoEnc: function(btn) {
        var
            me = this.app,
            win = btn.up('window'),
            form = win.down('form'),
            values = form.getValues(),
            record = form.getRecord(),
            store = Ext.getStore('ActasPromEncStore');
        this.onDataSave(record, values, store, values, win, false);
    },

    onActaGrado: function(btn) {
        var
            me = this.app,
            gb = Global;
        Ext.require('Admin.view.promocion.ActasGradoView');
        Ext.onReady(function() {
            me.onStore('general.MatriculadosStore');
            me.onStore('general.JornadasStore');
            me.onStore('general.GrupoStore');
            me.onStore('general.GradosStore');
            me.onStore('general.SedesStore');
            win = me.getWindow('Actas de grado - ' + gb.year, 'Admin.view.promocion.ActasGradoView');
            win.show();
            me.unmask();
        });
    },

    onPromovidos: function(btn) {
        Ext.create('Admin.view.promocion.PromovidosView').show();
    },

    onMover: function(btn) {
		let win = btn.up('form'),
			sel = btn.up('form').down('grid').getSelection(),
			me = this.app,
			data = {},
			store = Ext.getStore('MatriculadosStore'),
			grado = win.down('#cbGrados').getValue(),
			grupo = win.down('#cbGrupos').getValue(),
			jorn = win.down('#cbJornadas').getValue(),
			sede = win.down('#cbSedes').getValue(),
			cgrado = win.down('#comboGrados').getValue();

		let param;
		if (sel.length > 0) {
			win.mask('Moviendo estudiantes...');
			if (parseInt(grado) === parseInt(cgrado)) {
				win.unmask();
				me.onAler('No se puede mover estudiantes al mismo, grado.');
			} else {
				const values = [];

				sel.forEach(function (ele) {
					data = {
						enrollment: ele.get('id')
					};
					Ext.Array.push(values, data);
				});
				param = {
					pdbList	: Ext.encode(values),
					pdbGrado: grado,
					pdbGrupo: grupo,
					pdbJorn	: jorn,
					pdbSede	: sede,
					pdbGradoMove: cgrado,
					...Global.getSchoolParams()
				};
				Ext.Ajax.request({
					url: Global.getApiUrl() + '/promotion/advance-promotion',
					params: param,
					headers: Global.getHeaders(),
					success: function () {
						store.reload();
						win.unmask();
						me.showResult('Se han guardado los cambios.');
					},
					failure: function (response) {
						const error = JSON.parse(response.responseText);
						me.onError(error.message || 'Error en el servidor, código del estado ' + response.status);
					},
					callback: function (r, e) {
						win.unmask();
					}
				});
			}
		} else {
			me.onAler('No hay estudiantes para mover.');
		}
    },

    onPromAnti: function(btn) {
        this.redirectTo('promocionanticipada', true);
    },

    onSabanas: function(btn) {
        Ext.create('Admin.view.promocion.SabanaFinalesView').show();
    },

    onActasEstadistica: function(btn) {
        Ext.create('Admin.view.promocion.ActaPromocionEstaView').show();
    },

    onActas: function(btn) {
        Ext.create('Admin.view.promocion.ActaPromocionView').show();
    },

    onNivelaciones: function(btn) {
        Ext.create('Admin.view.promocion.NivelacionesFinales').show();
    },

    onCertificado: function(btn) {
        this.redirectTo('certificadofinal', true);
    },

    onLibroFinal: function(btn) {
        this.redirectTo('informefinal', true);
    },

    onMatricularAntiguos: function(btn) {
		let ts = btn.up('form'),
			sel = btn.up('form').down('grid').getSelection(),
			me = Admin.getApplication(),
			data = {},
			store = Ext.getStore('ListaMatriculaStore'),
			grado = ts.down('#comboGrados').selection.get('id'),
			grupo = ts.down('#cbGrupos').selection.get('grupo'),
			jorn = ts.down('#cbJornadas').selection.get('cod_jorn'),
			sede = ts.down('#cbSedes').selection.get('id');

		if (sel.length > 0) {
            ts.mask('Matriculando estudiantes...');
			let values = [],
				param = {};

			sel.forEach(ele => {
                data = {
                    id: ele.get('id')
                };
                values.push(data);
            });
            param = {
                pdbList: Ext.encode(values),
                pdbGrado: grado,
                pdbGrupo: grupo,
                pdbJorn: jorn,
                pdbSede: sede,
				...Global.getSchoolParams()
            };

            Ext.Ajax.request({
                url: Global.getApiUrl() + '/students/old-registration',
                params: param,
				headers: Global.getHeaders(),
                success: function(response, opts) {
                    store.reload();
                    ts.unmask();
                    me.showResult('Se han guardado los cambios.');
                },
                failure: function(response, opts) {
                    me.onError('Error en el servidor, código del estado ' + response.status);
                },
                callback: function(r, e) {
                    ts.unmask();
                }
            });
        } else {
            me.onAler('No hay estudiantes para matricular.');
        }
    },

    onViewAntiguos: function(btn) {
        this.redirectTo('enrollmentold', true);
    },

    /**
     * Funcion para setear los datos que se enviar al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn) {
		let url;
		let win = btn.up('window') || btn.up('form'),
			name = win.getItemId() || win.xtype,
			param = {};
		let record;
		let values;
		let grid;
		switch (name) {
            case 'HistorialAcademicoView':
				url = 'reports/academic-history';
				param = {
					pdbGrado: win.down('#comboGrados').getValue()
				};
				break;
            case 'SabanaFinalesView':
                values = win.down('form').getValues(),
                    url = 'reports/final-savannas',
                    record = win.down('form').getValues(),
                    param = {
                        pdbSede: record.id_sede,
                        pdbGrado: record.id_grado,
                        pdbJorn: record.cod_jorn,
                        pdbGrupo: record.grupo,
                        pdbAll: record.generar
                    };
                break;
            case 'ActasGradoView':
				values = win.down('form').getValues();
				url = 'reports/report_acta_grado';
				grid = win.down('grid');
				param = {
					pdbGrado: win.down('#comboGrados').getValue(),
					pdbJorn: win.down('#comboJornadas').getValue(),
					pdbGrupo: win.down('#comboGrupo').getValue(),
					pdbSede: win.down('#comboSedes').getValue(),
					pdbMatric: grid.getSelection()[0].get('id_matric'),
					pdbHoja: values.hoja,
					pdbModelo: values.modelo
				};
				break;
            case 'promovidos':
				url 	= 'reports/advanced-promotion';
				record 	= win.down('grid').getSelection()[0];
				param 	= {
					pdbId: record.get('id'),
					pdbGrade: record.get('grade_id')
				};
				break;
            case 'ActaPromocionEstaView':
				url = 'reports/minutes-promotion-statistics';
				param = {
					pdbType: win.down('#CkGrado').getValue() ? 1 : 0
				};
				break;
            case 'ActaPromocionView':
				url = 'reports/minutes-promotion';
				param = {
					pdbGrado: win.down('#comboGrados').getValue(),
					pdbJorn: win.down('#comboJornadas').getValue(),
					pdbGrupo: win.down('#comboGrupo').getValue(),
					pdbSede: win.down('#comboSedes').getValue()
				};
				break;
            case 'certificadofinal':
				values = win.getValues();
				url = 'reports/final-certificate';
				grid = win.down('grid');
				param = {
					pdbGrado: win.down('#comboGrados').getValue(),
					pdbJorn: win.down('#comboJornadas').getValue(),
					pdbGrupo: win.down('#comboGrupo').getValue(),
					pdbSede: win.down('#comboSedes').getValue(),
					pdbMatric: win.down('#ckEst').getValue() ? grid.getSelection()[0].get('id') : 0,
					pdbType: values.tipo,
					pdbHoja: values.hoja,
					pdbPer: values.periodo,
					pdbModelo: values.modelo,
					pdbDistrib: win.down('#CkDistrib').getValue() ? 1 : 0
				};
				break;
            case 'LibroFinalView':
				values = win.getValues();
				url = 'reports/final-report';
				grid = win.down('grid');

				param = {
                    pdbGrado: values.id_grado,
                    pdbJorn: values.cod_jorn,
                    pdbGrupo: values.grupo,
                    pdbSede: values.id_sede,
                    pdbMatric: (values.selection > 0) ? grid.getSelection()[0].get('id') : 0,
                    pdbPer: values.periodo,
                    pdbHoja: values.hoja
                };
                break;
            default:
				url = '';
				param = {};
				break;
        }
        this.onGenReport(btn, url, param);
    }
});
