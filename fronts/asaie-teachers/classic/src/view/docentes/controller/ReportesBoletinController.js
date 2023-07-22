Ext.define('Admin.view.docentes.controller.ReportesBoletinController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.Reporboletin',
    init: function() {
        me  = this;
        me.setConfigVar();
        me.control({
        });
	},

	onLibroFinal : function (btn) {
        this.redirectTo('informefinal', true);
	},
	
    onReportView : function (bnt) {
        Ext.create('Admin.view.docentes.BoletinesReportView',{
            title   : 'Boletines - '+Global.getYear()
        }).show();
    },
    /**
     * Funcion para setear los datos que se envía al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn){
		const url = 'reports/periodic-bulletin',
			win = btn.up('window'),
			grid = win.down('grid'),
			values = win.down('form').getValues();
		const comboData = win.down('#cbCargaDocente').getSelection();
		console.log(comboData);
		const param   = {
                pdbCodGrado : comboData.get('id_grado'),
                pdbIdJorn   : comboData.get('id_jorn'),
                pdbGrupo    : comboData.get('grupo'),
                pHojaReport : values.hoja,
                pTypeReport : values.id_report,
                pdbIdSede   : comboData.get('id_sede'),
                pdbPeriodo  : values.periodo,
                pdbMatric   : win.down('#ckEst').getValue() ? grid.getSelection()[0].get('id') : 0
            };
        this.onGenReport(btn,url,param);
    },
    onViewConsolidado : function (btn) {
        Ext.create('Admin.view.general.ConsolidadosReportView').show();
    },
    onViewEstadistica : function (btn) {
		const me = this.app;
		me.onStore('general.PeriodosStore');
        me.onStore('general.NivelesAcademicosStore');
        me.setParamStore('PeriodosStore',{
            pdbTable 	: 'periodos_academicos',
                pdbGrado	: 5,
                pdbType		: 2
        });
        Ext.create('Admin.view.convivencia.reportes.EstadisticaReportView').show();
    }
});
