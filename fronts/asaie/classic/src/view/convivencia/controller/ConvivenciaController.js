/**
 * Created by LEWIS on 17/11/2015.
 */
Ext.define('Admin.view.convivencia.controller.ConvivenciaController', {
    extend: 'Admin.base.BaseController',

    alias: 'controller.convivencia',

    init: function(){
        this.setConfigVar();

        this.control({
            'SituacionesView button#addButton' : {
               'click' : this.onCrudSituacionesView
            },

            'SituacionesView button#editButton' : {
                'click' : this.onCrudSituacionesView
            },

            'SituacionesViewCrud button#btnSave' : {
                'click' : this.onCrudSituacionesViewSave
            },

            'SituacionesRerEstudiantesViewCrud button#btnSave' : {
                'click' : this.SituacionesRerEstudiantesSave
            },

            'FormatosViewSave button#btnSave' : {
                'click' : this.onSaveFormato
            },

            'AccionesRerEstudiantesSaveView button#btnSave' : {
                'click' : this.onSaveAccionesEst
            },
            'ControlSeguimientoEstudiantesSaveView button#btnSave' : {
                'click' : this.onSaveControlEst
            }
        });

    },

    onSaveControlEst : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            data    = [],
            store   = Ext.getStore('ControlSeguimientoEstudiantesStore'),
            me      = this;

        data = {
            id_res_sit_est              : values.id_res_sit_est,
            compromiso_estudiante       : values.compromiso_estudiante,
            compromiso_acudiente        : values.compromiso_acudiente ,
            compromiso_docente          : values.compromiso_docente,
            fecha_acta                  : values.fecha_acta,
            hora_acta                   : values.hora_acta,
            estado                      : true
        };


        me.onDataSave(record, values, store, data, win);
    },

    onCruControl : function (btn) {
        var me   = this.app,
            win,
            form;

        Ext.require([
            'Admin.view.convivencia.coordidacion.ControlSeguimientoEstudiantesSaveView'
        ]);

        Ext.onReady(function(){

            win = me.getWindow(null,'Admin.view.convivencia.coordidacion.ControlSeguimientoEstudiantesSaveView');

            if (btn.itemId == 'editButton') {

                record = btn.up('grid').getSelection()[0];

                form = win.down('form');

                form.loadRecord(record);
            }

            win.show();

        });
    },

    onControl : function (btn) {
        var me      = this.app,
            win,
            select  = btn.up('grid').getSelection()[0],
            store   = '',
            param   = {
                pdbTable    : 'conv_control_seguimiento',
                pdbId       : select.get('id')
            };

        Ext.require([
            'Admin.view.convivencia.coordinacion.ControlSeguimientoEstudiantesView'
        ]);

        Ext.onReady(function() {

            me.onStore('convivencia.ControlSeguimientoEstudiantesStore');

            me.setParamStore('ControlSeguimientoEstudiantesStore',param);

            win = me.getWindow('Registro de control y seguimiento', 'Admin.view.convivencia.coordinacion.ControlSeguimientoEstudiantesView');
            win.show();
        });
    },

    onNavigationTreeSelectionChange: function (tree, node) {
        var selection = node.get('itemId'),
            queryComp   = Ext.ComponentQuery.query('Convivencia')[0].lookupReference('mainCardPanel'),
            nItemsComp  = queryComp.items.length,
            itemsAdd    = {},
            path;

        queryComp.el.mask(AppLang.getSMsgLoading());
        if (nItemsComp > 0) {
            queryComp.removeAll(true);
        }

        if (selection) {
            path    =   selection;
            if (!Ext.isEmpty(path)) {

                switch (path) {
                    case 'btnInicio' :

                        Ext.require([
                            'Admin.view.convivencia.psicorientacion.PanelContainerView'
                        ]);

                        Ext.onReady(function(){
                            queryComp.el.unmask();
                            me   = Admin.getApplication();
                           // me.onStore('docentes.CargaStore');
                            itemsAdd = {
                                xtype   : 'PanelContainerPsicorientacionView'
                            };
                        });

                        break;
                    case 'btnAcademico' :

                        Ext.require([
                            // 'Admin.view.academico.PanelContainerView'
                        ]);

                        Ext.onReady(function(){
                            queryComp.el.unmask();
                            me   = Admin.getApplication();
                            // me.onStore('docentes.CargaStore');
                            itemsAdd = {
                                xtype   : 'PanelContainerAcademicoView'
                            };
                        });
                        break;
                    case 'btnReportes' :

                        Ext.require([
                            'Admin.view.convivencia.reportes.PanelContainerReportesView'
                        ]);

                        Ext.onReady(function(){
                            queryComp.el.unmask();
                            me   = Admin.getApplication();
                            itemsAdd = {
                                xtype   : 'PanelContainerReportesView'
                            };
                        });
                        break;
                    case 'btnConvivencia' :
                        Ext.require([
                            'Admin.view.convivencia.coordinacion.PanelContainerView'
                        ]);

                        Ext.onReady(function(){
                            queryComp.el.unmask();
                            me   = Admin.getApplication();
                            itemsAdd = {
                                xtype   : 'PanelContainerCoordinacionView'
                            };
                        });
                        break;
                    case 'btnConfiguraciones' :

                        Ext.require([
                            'Admin.view.convivencia.configuraciones.PanelContainerView'
                        ]);

                        Ext.onReady(function(){
                            queryComp.el.unmask();
                            me   = Admin.getApplication();
                            itemsAdd = {
                                xtype   : 'PanelContainerConfiguracionesView'
                            };
                        });
                        break;

                    default :
                        queryComp.el.unmask();
                        itemsAdd = {

                        };
                        break
                }
                Ext.onReady(function() {
                    queryComp.add(itemsAdd);
                });
            }
        }
        else{
            queryComp.el.unmask();
        }

    },
    onViewSituaciones : function (btn) {
        var me  = this.app,
            win;

        Ext.require(
            'Admin.view.convivencia.configuraciones.SituacionesView'
        );

        Ext.onReady(function () {
            me.onStore('convivencia.SituacionesStore');
            me.onStore('convivencia.SituacionesTipoStore');
            win = me.getWindow('Situaciones','Admin.view.convivencia.configuraciones.SituacionesView');

            win.show();
        });

    },

    onViewSituacionesTipo : function (btn) {
        var me  = this.app,
            win;

        Ext.require(
            'Admin.view.convivencia.configuraciones.SituacionesTipoView'
        );

        Ext.onReady(function () {
            me.onStore('convivencia.SituacionesTipoStore');
            win = me.getWindow('Tipo de situaciones','Admin.view.convivencia.configuraciones.SituacionesTipoView');

            win.show();
        });

    },

    onCrudSituacionesView : function (btn) {
        var me = this,
            win,
            form,
            record;

        if (btn.itemId == 'addButton'){
            win = me.app.getWindow('Nuevo - Situaciones','Admin.view.convivencia.configuraciones.SituacionesViewCrud');
        }else{
            win     = me.app.getWindow('Edición - Situaciones','Admin.view.convivencia.configuraciones.SituacionesViewCrud');
            form    = win.down('form');

            record  = Ext.ComponentQuery.query('SituacionesView')[0].down('grid').getSelection()[0];
            form.loadRecord(record);
        }

        win.show();
    },

    onCrudSituacionesViewSave : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            data    = [],
            store   = Ext.getStore('SituacionesStore'),
            me      = this;

            data = {
                numero      : values.numero,
                descripcion : values.descripcion,
                id_tipo     : values.id_tipo,
                estado      : values.estado
            };


            me.onDataSave(record, values, store, data, win);
    },

    onViewSituacionesTipoI : function (btn) {
        var me   = this.app,
            win;

        Ext.require([
            'Admin.view.convivencia.coordinacion.EstudiantesView'
        ]);

        Ext.onReady(function(){


            if(btn.itemId == 'btnSituacionesTipoII') {
                xType = 2;
            }else{
                xType = 1;
            }

            me.onStore('docentes.EstudiantesStore');
            me.onStore('general.GradosStore');
            me.onStore('general.GrupoStore');
            me.onStore('general.JornadasStore');

            me.onStore('convivencia.SituacionesStore');

            store = Ext.getStore('SituacionesStore');

            extra = {
                pdbTable : 'conv_situaciones',
                pdbType  : xType
            };

            me.setParamStore(store,extra);

            win = me.getWindow('Registro de situaciones tipo: '+xType,'Admin.view.convivencia.coordinacion.EstudiantesView');
            win.showToll = false;
            win.show();

        });
    },

    onViewSituacionesTipoII : function (btn) {
       this.onViewSituacionesTipoI(btn);
    },

    onSituacionesEst : function (btn) {
        var me   = this.app,
            win,
            winshow = btn.up('window'),
            record  = btn.up('window').down('grid').getSelection()[0];

        Ext.require([
            'Admin.view.convivencia.coordinacion.SituacionesRegEstuduantesView'
        ]);

        Ext.onReady(function(){

            ExtraP = {
                pdbIdMatric     : record.get('id_matric'),
                pdbTable        : 'conv_reg_situaciones_est'
            };

            me.onStore('convivencia.SituacionesRegEstudiantesStore');

            store   = Ext.getStore('SituacionesRegEstudiantesStore');

            me.setParamStore(store,ExtraP);

            win = me.getWindow('Registro de situaciones: '+record.get('nombres'),'Admin.view.convivencia.coordinacion.SituacionesRegEstuduantesView');
            if (winshow.showToll){
               /* win.down('#toolAcciones').setHidden(false);*/
            }
            win.show();

        });
    },

    onCrudSituacionesEst : function (btn) {
        var me   = this.app,
            win,
            form;

        Ext.require([
            'Admin.view.convivencia.configuraciones.SituacionesRerEstudiantesViewCrud'
        ]);

        Ext.onReady(function(){

            me.onStore('general.DocentesStore');
            me.onStore('general.AdministrativosStore');

           if (btn.itemId == 'addButton') {
               win = me.getWindow('Nuevo - Registro de situaciones','Admin.view.convivencia.configuraciones.SituacionesRerEstudiantesViewCrud');

           }else{

               win = me.getWindow('Edición - Registro de situaciones','Admin.view.convivencia.configuraciones.SituacionesRerEstudiantesViewCrud');

               record = btn.up('window').down('grid').getSelection()[0];

               form = win.down('form');

               form.loadRecord(record);
           }

            win.show();

        });
    },

    SituacionesRerEstudiantesSave : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            data    = [],
            store   = Ext.getStore('SituacionesRegEstudiantesStore'),
            me      = this,
            records  = Ext.ComponentQuery.query('EstudiantesView')[0].down('grid').getSelection()[0];


        data = {
            id_matric       : records.get('id_matric'),
            id_situacion    : values.id_situacion,
            observacion     : values.observacion,
            id_docente      : values.id_docente,
            id_admin        : values.id_admin,
            fecha_registro  : values.fecha_registro
        };

        me.onDataSave(record, values, store, data, win);
    },
    onAccionesTipoI : function (btn) {
        var me   = this.app,
            win;

        Ext.require([
            'Admin.view.convivencia.coordinacion.EstudiantesView'
        ]);

        Ext.onReady(function(){


            if(btn.itemId == 'btnAccionesTipoII') {
                xType = 2;
            }else{
                xType = 1;
            }

            me.onStore('docentes.EstudiantesStore');
            me.onStore('general.GradosStore');
            me.onStore('general.GrupoStore');
            me.onStore('general.JornadasStore');

            me.onStore('convivencia.SituacionesStore');

            store = Ext.getStore('SituacionesStore');

            extra = {
                pdbTable : 'conv_situaciones',
                pdbType  : xType
            };

            me.setParamStore(store,extra);

            win = me.getWindow('Registro de acciones y situaciones tipo: '+xType,'Admin.view.convivencia.coordinacion.EstudiantesView');

            win.showToll = true;

            win.show();

        });
    },

    onAccionesTipoII : function (btn) {
        this.onAccionesTipoI(btn);
    },

    onAcciones : function (btn) {
        var me      = this.app,
            win,
            select  = btn.up('grid').getSelection()[0],
            store   = '',
            param   = {
                pdbTable    : 'conv_reg_acciones_est',
                pdbId       : select.get('id')
            };

        Ext.require([
            'Admin.view.convivencia.psicorientacion.AccionesRegEstudiantesView'
        ]);

        Ext.onReady(function() {

            me.onStore('convivencia.AccionesRegEstudiantesStore');
            me.onStore('convivencia.AccionesStore');
            me.onStore('general.AdministrativosStore');
            store   = Ext.getStore('AccionesRegEstudiantesStore');
            me.setParamStore(store,param);

            win = me.getWindow('Registro de Acciones', 'Admin.view.convivencia.psicorientacion.AccionesRegEstudiantesView');
            win.show();
        });
    },

    onNewFormato : function (btn) {
        var me   = this.app,
            win,
            form,
            record;

        if (btn.itemId == 'addButton') {
            win = me.getWindow('Nuevo - Formato','Admin.view.convivencia.psicorientacion.FormatosViewSave');
            win.show();
        }else{
            win = me.getWindow('Edición - Formato','Admin.view.convivencia.psicorientacion.FormatosViewSave');

            record = btn.up('window').down('grid').getSelection()[0];
            form    = win.down('form');
            form.loadRecord(record);
            win.show();
        }
    },

    onSaveFormato : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            data    = [],
            store   = Ext.getStore('FormatosStore'),
            me      = this;

        data = {
            id_accion           : values.id_accion,
            titulo              : values.titulo,
            cuerpo              : values.cuerpo,
            comprension_lectora : values.comprension_lectora
        };


        me.onDataSave(record, values, store, data, win);
    },

    onViewEstadistica : function (btn) {
        var me = this.app;
        Ext.require([
            'Admin.view.convivencia.reportes.EstadisticaReportView'
        ]);

        Ext.onReady(function() {

           me.onStore('general.PeriodosStore');


            win = me.getWindow(null, 'Admin.view.convivencia.reportes.EstadisticaReportView');
            win.show();
        });
    },

    onSetReport : function (btn) {
        var url     = 'c_convivencia/get_report_estadistica',
            param   = {},
            win     = btn.up('window'),
            wName   = win. getItemId(),
            form    = win.down('form'),
            grid    = btn.up('grid'),
            values  = {};
        switch (wName) {
            case 'EstadisticaReportView' :
                url     = 'c_convivencia/get_report_estadistica';
                values  = form.getValues();
                param   = {
                    pbdNivel        : values.nivel,
                    pdbPeriodo      : values.periodo,
                    pdbAllPer       : values.allper,
                    pdbTypeReport   : values.informe
                };
                break;
            case 'AccionesRegEstudiantesView' :
                url     = 'c_convivencia/get_report_acciones_estudiante';
                values  = grid.getSelection()[0];
                param   = {
                    pbdId        : values.get('id')
                };
                break;
            case 'ControlSeguimientoEstudiantesView' :
                url     = 'c_convivencia/get_report_acta_ctrl_seguimiento';
                values  = grid.getSelection()[0];
                param   = {
                    pbdId        : values.get('id'),
                    pdbIdMatric  : Ext.ComponentQuery.query('SituacionesRegEstuduantesView')[0].down('grid').getSelection()[0].get('id_matric')
                };
                break;
            default : url     = '';
                break;
        }
        this.onGenReport(btn,url,param);
    },

    onViewConsolidado : function (btn) {
        var me = this.app;
        Ext.require([
            'Admin.view.general.ConsolidadosReportView'
        ]);

        Ext.onReady(function() {

            me.onStore('general.PeriodosStore');
            me.onStore('general.GradosStore');
            me.onStore('general.GrupoStore');
            me.onStore('general.JornadasStore');
            me.onStore('general.SedesStore');


            win = me.getWindow(null, 'Admin.view.general.ConsolidadosReportView');
            win.show();
        });
    },

    onCrudAccionesEst : function (btn) {
        var me   = this.app,
            win,
            form;

        Ext.require([
            'Admin.view.convivencia.psicorientacion.AccionesRerEstudiantesSaveView'
        ]);

        Ext.onReady(function(){

            if (btn.itemId == 'addButton') {
                win = me.getWindow('Nuevo - Registro de accciones','Admin.view.convivencia.psicorientacion.AccionesRerEstudiantesSaveView');

            }else{

                win = me.getWindow('Edición - Registro de acciones','Admin.view.convivencia.psicorientacion.AccionesRerEstudiantesSaveView');

                record = btn.up('grid').getSelection()[0];

                form = win.down('form');

                form.loadRecord(record);
            }

            win.show();

        });
    },

    onSaveAccionesEst : function (btn) {
        var win     = btn.up('window'),
            form    = win.down('form'),
            record  = form.getRecord(),
            values  = form.getValues(),
            data    = [],
            store   = Ext.getStore('AccionesRegEstudiantesStore'),
            me      = this;
        me.onDataSave(record, values, store, values, win);
    }
});