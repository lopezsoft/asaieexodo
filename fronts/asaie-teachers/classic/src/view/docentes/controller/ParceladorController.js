/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.view.docentes.controller.ParceladorController',{
    extend  : 'Admin.base.BaseController',

    alias : 'controller.parcelador',

    init : function () {
        // Cargamos las propiedades de configuración.
        this.setConfigVar();

        this.control({
            'ParceladorView button#addButton' : {
                click   : this.onAddParcelador
            },

            'ParceladorView button#editButton' : {
                click   : this.onAddParcelador
            },

            'ParceladorView #btnUnidades' : {
                click   : this.onUnidades
            },

            'ParceladorView #btnContenido' : {
                click   : this.onContenido
            },

            'ParceladorNewView button#btnSave' : {
                click   : this.onSaveParcelador
            },

            'ParceladorCliView button#addButton' : {
                click   : this.onNewCli
            },

            'ParceladorCliView button#editButton' : {
                click   : this.onNewCli
            },

            'ParceladorCliNewView button#btnSave' : {
                click   : this.onSaveCli
            },

            'ParceladorConTemView button#addButton' : {
                click   : this.onContenidoNew
            },

            'ParceladorConTemView button#editButton' : {
                click   : this.onContenidoNew
            },

            'ParceladorConTemNewView button#btnSave' : {
                click   : this.onContenidoSave
            },

            'ParceladorUnidadesView button#addButton' : {
                click   : this.onUnidadesNew
            },

            'ParceladorUnidadesView button#editButton' : {
                click   : this.onUnidadesNew
            },

            'ParceladorUnidadesNewView button#btnSave' : {
                click   : this.onUnidadesSave
            },

            'PlanSemanalNewView button#btnSave' :{
                click   : this.onSavePlan
            }

        });
    },

    /**
     * funcion que crea la vista para acrear un nuenvo parcelador de clases
     * @param btn
     */

    onAddParcelador : function(btn) {
        var me      = this.app,
            win     = null,
            form    = null,
            record  = null;
        Ext.require([
            'Admin.view.docentes.ParceladorNewView'
        ]);
        Ext.onReady(function () {
            me.onStore('docentes.GradosDocenteStore');
            me.onStore('general.AsignaturasStore');
            me.onStore('general.MetodologiasStore');
            me.onStore('general.PeriodosStore');
            me.onStore('general.SedesStore');
            me.onStore('docentes.AsigaturasGradoDocenteStore');
            win = me.getWindow('Nuevo/Editar Parcelador - '+Global.getYear(),'Admin.view.docentes.ParceladorNewView');
            if (btn.itemId === 'editButton'){
                record  = btn.up('grid').getSelection()[0];
                form    = win.down('form');
                form.loadRecord(record);
                codGrado    = record.get('id_grado');
                extParam    = {
                    pdbGrado : codGrado
                };
                me.setParamStore('AsignaturasStore',extParam);
            }
            win.show();
        });
    },

    /**
     * Funcion que se ejecuta al hacer click sobre el boton guardar de la vista ParceladorNewView
     * @param btn
     */
    onSaveParcelador : function (btn) {
        var win 	= btn.up('window'),
            form 	= win.down('form'),
            values 	= form.getValues(),
            record 	= form.getRecord(),
            grid 	= Ext.ComponentQuery.query('ParceladorView')[0],
            store 	= grid.getStore(),
            data    = values;
        this.onDataSave(record,values,store,data,win,true);
    },

    /**
     * Funcion que crea la vista para la inserción y edición de Competencias, Logros e Indicadores
     * @param btn
     */
    onCli : function (btn) {
        var
            me          = this.app,
            select      = Ext.ComponentQuery.query('ParceladorView')[0].getSelection()[0];
        extPar = {
            pdbGrado  : select.get('id_grado'),
            pdbId     : select.get('id'),
            pdbTable  : 'parcelador_cli'
        };
        me.onStore('docentes.ParceladorCliStore');
        me.setParamStore('ParceladorCliStore',extPar,false);
        win = me.getWindow('Descriptores: '+select.get('asignatura'),'Admin.view.docentes.ParceladorCliView');
        win.show();
    },

    /**
     * Funcion que crea la vista para la inserción y edición de las unidades y ejes temáticos
     * @param btn
     */
    onUnidades : function (btn) {
        var grid     = btn.up('grid'),
            me      = this.app;
            record  = grid.getSelection()[0];
        me.onStore('docentes.ParceladorUnidadesStore');
        extPar = {
            pdbId   : record.get('id'),
            pdbTable: 'parcelador_unidades'
        };
        me.setParamStore('ParceladorUnidadesStore',extPar);
        win = me.getWindow('Unidades / Ejes temáticos','Admin.view.docentes.ParceladorUnidadesView');
        win.show();
    },

    onUnidadesNew : function (btn) {
        var win,form,
            grid    = btn.up('window').down('grid');
            me      = this.app,
            record  = grid.getSelection()[0];
		win = me.getWindow('Nuevo/Editar - Unidades / Ejes temáticos','Admin.view.docentes.ParceladorUnidadesNewView');
        if (btn.itemId=='editButton') {
        	form = win.down('form');
            form.loadRecord(record);
        }
        win.show();
    },

    onUnidadesSave : function (btn) {
        var win 	= btn.up('window'),
            form 	= win.down('form'),
            values 	= form.getValues(),
            record 	= form.getRecord(),
            grid 	= Ext.ComponentQuery.query('ParceladorUnidadesView')[0].down('grid'),
            store 	= grid.getStore();
        this.onDataSave(record,values,store,values,win,true);
    },

    /**
     * Funcion que crea la vista para la inserción y edición del contenido temático del pacerlador
     * @param btn
     */
    onContenido : function (btn) {
        var grid     = btn.up('grid'),
            me      = this.app;
            record  = grid.getSelection()[0];
        me.onStore('docentes.ParceladorConTemStore');
        me.onStore('docentes.ParceladorItemsConTemStore');
        extPar = {
            pdbId       : record.get('id'),
            pdbTable    : 'parcelador_con_tem'
        };
        me.setParamStore('ParceladorConTemStore',extPar);
        win = me.getWindow('Contenido temático','Admin.view.docentes.ParceladorConTemView');
        win.show();
    },

    onContenidoNew : function (btn) {
        var win,form,
            grid    = btn.up('window').down('grid');
            me      = this.app,
            record  = grid.getSelection()[0];
		win = me.getWindow('Nuevo/Editar - Contenido temático','Admin.view.docentes.ParceladorConTemNewView');
        if (btn.itemId=='editButton') {
        	form = win.down('form');
            form.loadRecord(record);
        }
        win.show();
    },

    onContenidoSave : function (btn) {
        var win 	= btn.up('window'),
            form 	= win.down('form'),
            values 	= form.getValues(),
            record 	= form.getRecord(),
            grid 	= Ext.ComponentQuery.query('ParceladorConTemView')[0].down('grid'),
            store 	= grid.getStore();
        this.onDataSave(record,values,store,values,win,true);
    },

    /**
     * Funcion para crear la vista de los indicadores, competencis y logros del parcelador
     * @param btn
     */

    onNewCli : function (btn) {
        var win,
            me      = this.app,
            record  = Ext.ComponentQuery.query('ParceladorCliView')[0].down('grid').getSelection()[0];
        me.onStore('general.CompetenciasStore');
		me.onStore('general.TipoProcesosStore');
		win = me.getWindow('Descriptores','Admin.view.docentes.ParceladorCliNewView');
        if(btn.itemId === 'editButton') {
            form = win.down('form');
            form.loadRecord(record);
        }
        win.show();
    },

    onSaveCli : function(btn){
        var win 	= btn.up('window'),
            form 	= win.down('form'),
            values 	= form.getValues(),
            record 	= form.getRecord(),
            grid 	= Ext.ComponentQuery.query('ParceladorCliView')[0].down('grid'),
            store 	= grid.getStore(),
            me      = this;
        me.onDataSave(record,values,store,values,win,true);
    },

    /**
     * Funcion que gerena los reportes
     * @param btn
     * @param e
     * @param eOpts
     */

    onSetReport: function (btn, e, eOpts) {
        var grid	= Ext.ComponentQuery.query('ParceladorView')[0],
            select	= grid.getSelection()[0],
            me  	= this,
            cUrl	= 'reports/report_parcelador';
        param = {
            pId			: select.get('id'),
            pdbPeriodo	: select.get('periodo')
        };
        me.onGenReport(btn,cUrl,param);
    },
    onAddPlan: function (btn) {
        var me = this,
            win, form,
            record = Ext.ComponentQuery.query('PlanSemanalView')[0].getSelection()[0];
		win = me.app.getWindow('Nuevo/Editar - Plan semanal de clase','Admin.view.docentes.PlanSemanalNewView');
        if (btn.itemId === 'editButton') {
            form = win.down('form');
            form.loadRecord(record);
        }
        win.show();
    },
    onSavePlan : function (btn) {
        var win 	= btn.up('window'),
            form 	= win.down('form'),
            values 	= form.getValues(),
            record 	= form.getRecord(),
            grid 	= Ext.ComponentQuery.query('PlanSemanalView')[0],
            store 	= grid.getStore();
        this.onDataSave(record,values,store,values,win,true);
    },


    /**
     * Funcion que crea la vista para importar los logros, indicadores, fortaleza o dificultades del banco
     * establecido por el plantel educativo
     * @param btn
     */

    onImportCli : function (btn) {
        var win, me = this;

        me.app.onStore('general.AsignaturasBancoStore');

        extra   = {
            pdbCodGrado : '0',
            pdbPeriodo  : '0',
            pdbIdAsig   : '0',
            pdbType     : 0
        };

        me.app.setParamStore('BancoCliStore',extra,true);

        win = me.app.getWindow(null,'Admin.view.docentes.BancoCliView');

        win.show();

    },

    onSearchImport : function (btn) {
        var win     = btn.up('window'),
            select = Ext.ComponentQuery.query('ParceladorView')[0].getSelection()[0],
            asigna  = win.down('#CbAsignaturas').getSelection(),
            nType   = Ext.ComponentQuery.query('ParceladorCliView')[0].typeCli,
            me      = this;

        extra   = {
            pdbCodGrado : select.get('cod_grado'),
            pdbPeriodo  : select.get('periodo'),
            pdbIdAsig   : asigna.get('id'),
            pdbType     : nType
        };

        me.app.setParamStore('BancoCliStore',extra,true);
    },

    onImport : function (btn) {
        var win     = btn.up('window'),
            grid    = win.down('grid'),
            select  = grid.getSelection(),
            me      = this,
            nCount  = 0,
            store   = Ext.getStore('ParceladorCliStore'),
            nType   = Ext.ComponentQuery.query('ParceladorCliView')[0].typeCli;

        if (select.length > 0) {
            for(nCount = 0; nCount < select.length; nCount++){
                data    = {
                    descripcion  : select[nCount].get('descripcion'),
                    tipo    	 : nType
                };

                store.insert(0,data);
            }

            store.sync({
                callback : function (r) {
                    store.reload();
                }
            });

            win.close();

        }else {
            me.app.showResult('No a seleccionado datos para importar...');
        }
    }


});
