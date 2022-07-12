/**
 * Created by LOPEZSOFT2 on 10/12/2016.
 */
Ext.define('Admin.view.simulacros.controller.SimulacrosController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.Simulacros',

    init: function () {
        me = this;

        me.setConfigVar();

        me.control({
            'AreasSimView button#btnSave' : {
                click : this.onSaveAreas
            },
            'AreasSimView button#editButton' : {
                click : this.onSaveAreas
            }
        });
    },

    addAsginaturas : function (btn) {
        var me  = this.app,
            win = btn.up('window'),
            grid= win.down('#gridCarga'),
            select      = grid.getSelection(),
            idMatric    = win.down('grid').getSelection()[0].get('id_matric'),
            store       = null,
            grado       = win.down('grid').getSelection()[0].get('cod_grado'),
            data        = {},
            per         = win.down('#periodo').value,
            i           = 0;

        if (select.length > 0 ) {
            if (!Ext.isEmpty(per)) {
                store = new Ext.create('Admin.store.base.StoreApi', {
                    fields: [
                        {name: 'id_asig'},
                        {name: 'id_matric'},
                        {name: 'periodo'}
                    ],
                    proxy: {
                        extraParams: {
                            pdbGrado: grado
                        },
                        api: {
                            create: 'academic/get_add_asignaturas',
                            read: 'General/get_select',
                            update: 'General/update_data',
                            destroy: 'General/delete_data'
                        }
                    }
                });

                for (i = 0; i < select.length; i++) {
                    data = {
                        id_asig     : select[i].get('id_asig'),
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

    onSaveAsignaturas  : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            data    = [],
            store   = Ext.getStore('AsignaturaStore'),
            me      = this,

            data = {
                excluir         : values.excluir,
                electiva        : values.electiva,
                asignatura      : values.asignatura,
                cod_area        : values.cod_area,
                ordenar         : values.ordenar,
                abrev           : values.abrev,
                estado          : values.estado
            };

        me.onDataSave(record, values, store, data, win);
        win.close();
    },

    onCreateAsignaturasView : function (btn) {
        var me = this.app,
            record, form;

        win = me.getWindow('Nuevo/Editar Asignaturas acdémicas - '+Global.getYear(), 'Admin.view.academico.AsignaturasView');
        if (btn.itemId == 'editButton'){
            form = win.down('form');
            record = btn.up('window').down('grid').getSelection()[0];

            form.loadRecord(record);
        };
        win.show();
    },

    onSesionPruebas : function (btn) {
        var me = this.app;
        me.onMsgWait();
        Ext.require([
            'Admin.view.simulacros.SesionesCrudView'
        ]);
        Ext.onReady(function() {
            me.onStore('simulacros.SesionesStore');
            me.onStore('simulacros.AreasSimStore');
            win = me.getWindow('Ficha sesiones - '+Global.getYear(), 'Admin.view.simulacros.SesionesCrudView');
            me.onMsgClose();
            win.show();
        });
    },

    onSaveAreas : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            store   = Ext.getStore('AreasSimStore'),
            me      = this;

        me.onDataSave(record, values, store, values, win);
        win.close();
    },

    onCreateAreasView : function (btn) {
        var me = this.app,
            record, form;

            win = me.getWindow('Nuevo/Editar Áreas acdémicas - '+Global.getYear(), 'Admin.view.simulacros.AreasSimView');
        if (btn.itemId == 'editButton'){
            form = win.down('form');
            record = btn.up('window').down('grid').getSelection()[0];

            form.loadRecord(record);
        };
        win.show();
    },

    onCreateAreas : function (btn) {
        var me = this.app;
        me.onMsgWait();
        Ext.require([
            'Admin.view.simulacros.AreasCrudSimView'
        ]);

        Ext.onReady(function() {

            me.onStore('simulacros.AreasSimStore');

            win = me.getWindow('Ficha Áreas acdémicas - '+Global.getYear(), 'Admin.view.simulacros.AreasCrudSimView');
            me.onMsgClose();
            win.show();
        });
    },

    onViewReportes : function (btn) {
        var me = this.app;
        Ext.require([
            'Admin.view.academico.reportes.ReportesView'
        ]);

        Ext.onReady(function() {

            // me.onStore('general.PeriodosStore');
            win = me.getWindow(null, 'Admin.view.academico.reportes.ReportesView');
            win.show();
        });
    },

    /**
     * Funcion para setear los datos que se enviar al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn){
        var url     = '',
            win     = btn.up('window'),
            name    = win.self.getName();

        if(name == 'Admin.view.academico.NotasReportadasView'){
            var
                url     = 'reports/report_nota_reportada',
                values  = win.down('#gridCarga').getSelection()[0],
                param   = {
                    pdbGrado    : values.get('cod_grado'),
                    pdbGrupo    : values.get('grupo'),
                    pdbJorn     : values.get('cod_jorn'),
                    pdbDocente  : values.get('id_docente'),
                    pdbSede     : values.get('id_sede'),
                    pdbPeriodo  : win.down('#periodo').selection.get('periodo'),
                    pdbAsig     : values.get('id_asig'),
                    pdbType     : 1
                };
        }else{
            var
                url     = 'reports/report_ficha_matricula',
                values  = win.down('grid').getSelection()[0],
                param   = {
                    pdbCodEst : values.get('cod_est'),
                    pdbType   : 1
                };
        }

        this.onGenReport(btn,url,param);
    }
});
