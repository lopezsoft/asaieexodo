Ext.define('Admin.view.docentes.controller.RecuperacionesController',{
    extend: 'Admin.base.BaseController',
        alias: 'controller.recuperaciones',
	init: function() {
		this.setConfigVar();
	},
    onViewRecPeriodica : function (btn) {
        this.redirectTo('periodicteacherleveling', true);
    },

    onViewRecFinal : function (btn) {
        var
            me   	= this.app,
			url     = Global.getUrlBase() +'general/get_config_db';
        me.onStore('docentes.RecuperacionesFinalesStore');
        Ext.Ajax.request({
            url     : url ,
            params  : {
                pdbGrado: 0
            },
            success: function(response){
                result 	= Ext.decode(response.responseText);
                Global.setDbConfig(result.records);
                Ext.create('Admin.view.docentes.RecuperacionesFinalesView').show();
            },
            failure: function (response) {
                me.onAler('No se pueden cargar los datos');
            }
        });
    },

    onClickCargar : function(btn){
        var	grid	= btn.up('grid'),
            select	= grid.getSelection()[0],
            me		= Admin.getApplication(),
            ts      = btn.up('form'),
			url     = Global.getUrlBase() +'general/get_config_db';
        me.onStore('docentes.RecuperacionesPeriodicasStore');
        extra	= {
            pdbTable 	: 'periodos_academicos',
            pdbGrado	: select.get('id_grado'),
            pdbType		: 0
        };
        me.setParamStore('PeriodosStore',extra,true);
        ts.mask();
        Ext.Ajax.request({
            url     : url,
            params  : {
                pdbGrado: select.get('id_grado')
            },
            success: function(response){
                result 	= Ext.decode(response.responseText);
                Global.setDbConfig(result.records);
                Ext.create('Admin.view.docentes.CargarNivelaciones',{
                    title   : 'Nivelaciones periódicas - '+select.get('grado')+' - '+select.get('asignatura'),
                    record  : select
                }).show();
            },
            failure: function (response) {
                me.onAler('No se pueden cargar los datos');
            },callback  : function(){
                ts.unmask();
            }
        });
    },

    onSelectPeriodo	: function(btn) {
        var win		= btn.up('window'),
            select	= win.getRecord(),
            me		= Admin.getApplication(),
            btn1	= win.down('#printButton');
        if (!btn1.isDisabled()) {
            btn1.setDisabled(true);
        }
        param	= {
            pdbGrado 	: select.get('id_grado'),
            pdbAsig		: select.get('id_asig'),
            pdbPeriodo	: win.down('#periodo').value,
            pdbType     : 0
        };
        me.setParamStore('RecuperacionesPeriodicasStore',param, true);
    },


    onSetReport: function (btn, e, eOpts) {
        var url     = '',
            win     = btn.up('window'),
            name    = win.getItemId();
        switch (name){
            case 'RecuperacionesFinalesView' :
                var
                    grid	= win.down('grid'),
                    select	= grid.getSelection()[0];
                url	= 'reports/recuperaciones_finales';
                param  = {
                    pdbDocente     : select.get('id_docente')
                };
                break;
            default :
                var
                    url     = 'reports/periodic-leveling',
                    select	= win.down('grid').getSelection()[0],
                    param   = {
                        pdbGrado 	: select.get('id_grado'),
                        pdbType     : 0,
                        pdbNivel    : 0,
                        pdbReport   : 0,
                        pdbPeriodo  : select.get('periodo')
                    };
                break;
        }
        this.onGenReport(btn,url,param);
    },

    onClickUndoFinal	: function(btn, e, eOpts) {
        var win 	= btn.up('grid'),
            store 	= Ext.getStore('RecuperacionesFinalesStore'),
            btn1	= win.down('#saveButton');

        btn1.setDisabled(true);

        btn.setDisabled(true);

        store.rejectChanges();
    },

    onClickSaveFinal : function(btn, e, eOpts) {
        var grid 	= btn.up('grid'),
            store 	= Ext.getStore('RecuperacionesFinalesStore'),
            me		= this,
            btn1	= grid.down('#saveButton'),
            btn2	= grid.down('#undoButton');
        modified = store.getModifiedRecords();
        if(!Ext.isEmpty(modified)){
            grid.el.mask('Guardando…', 'x-mask-loading');
            store.sync({
                success: function(response){
                    result 	= Ext.decode(response.responseText);
                    grid.el.unmask();
                    grid.getStore().commitChanges();
                    btn1.setDisabled(true);
                    btn2.setDisabled(true);
                    grid.getStore().reload();
                },
                failure: function (response) {
                    grid.el.unmask();
                    me.app.onError(response.responseText);
                }
            });

        }else{
            btn1.setDisabled(true);
            btn2.setDisabled(true);
        }
    }
});
