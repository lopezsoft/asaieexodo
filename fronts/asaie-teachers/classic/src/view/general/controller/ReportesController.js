Ext.define('Admin.view.general.controller.ReportesController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.ReportesGeneral',

    init: function() {
        me  = this;
        me.setConfigVar();
    },
    /**
     * Funcion para setear los datos que se envía al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn){
		let win     	= btn.up('window');
		let xtype		= btn.up('window').xtype || btn.up('form').xtype;
		const comboData = win.down('#cbCargaDocente').getSelection();
		let param;
		let url;
		switch (xtype) {
			case 'generarcarnets':
				url = 'reports/school-carnes';
				const ts = btn.up('window'),
					tab = ts.down('customtab').getActiveTab();
				param = {};
				param.ckAll		= ts.down('#ckAll').getValue() ? 1 : 0;
				param.ckRes		= ts.down('#ckRes').getValue() ? 1 : 0;
				param.pdbId		= tab.down('grid').getSelection()[0].id;
				if(tab.title === 'Docentes'){
					param.pdbType	= 2;
				}else{
					param.pdbType	= 1;
				}
				this.onGenReport(btn,url,param);
				break;
			default:
				url = 'reports/consolidated';
				let values = win.down('form').getValues();
				param = {
					pdbCodGrado	: comboData.get('id_grado'),
					pdbIdJorn	: comboData.get('id_jorn'),
					pdbGrupo	: comboData.get('grupo'),
					pHojaReport	: values.hoja,
					pTypeReport	: values.id_report,
					pdbIdSede	: comboData.get('id_sede'),
					pdbPeriodo	: values.periodo,
					pdbAllPer	: values.allper
				};
				this.onGenReport(btn,url,param);
				if (btn.itemId === 'btnXls'){
					this.onDownLoadReportXls(btn,url,param);
				}
				break;
		}
    },

    onDownLoadReportXls: function (btn, url, param) {

		let me = this,
			cUrl = Global.getUrlBase() + 'excel_manager/download_report_consolidado',
			vMask;

		vMask = btn.up('window');

        if (Ext.isEmpty(vMask)){
            vMask   = btn.up('grid');
        }
		let xFormat;
        switch(btn.itemId){
            case 'btnHtml':
                xFormat = 'html';
                break;
            case 'btnRtf':
                xFormat = 'rtf';
                break;
            case 'btnXls':
                xFormat = 'xls';
                break;
            case 'btnDoc':
                xFormat = 'doc';
                break;
            case 'btnCsv':
                xFormat = 'csv';
                break;
            case 'btnPptx':
                xFormat = 'pptx';
                break;
            case 'btnPrint':
                xFormat = 'print';
                break;
            default	:
                xFormat = 'pdf';
                break;
        }


		let xParam;
		if (!Ext.isEmpty(url) && btn.itemId === 'btnXls') {

			xParam = param;

			Object.defineProperty(xParam, 'pFormat', {
				value: xFormat,
				writable: true,
				enumerable: true,
				configurable: true
			});

			Ext.Ajax.request({
				timeout: 60000,
				url: cUrl,

				params: xParam,

				success: function (response) {
					let result = Ext.decode(response.responseText);
					me.onOpenUrl(result.pathFile);
				},

				failure: function (response) {
					me.app.onError('No se pueden cargar los datos');
				},

				callback: function (response) {
					if (!Ext.isEmpty(vMask)) {
						vMask.el.unmask();
					}
				}
			});
		}
    }
});
