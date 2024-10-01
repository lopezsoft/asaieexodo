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
		let xtype	= btn.up('window').xtype || btn.up('form').xtype;

		switch (xtype) {
			case 'generarcarnets':
				var url     = 'reports/school-carnes',
					ts      = btn.up('window'),
					tab		= ts.down('customtab').getActiveTab(),
					param	= {};
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
				var url     = 'reports/consolidated',
					win     = btn.up('window'),
					values  = win.down('form').getValues(),
					param   = {
						pdbCodGrado : values.id_grado,
						pdbIdJorn   : values.cod_jorn,
						pdbGrupo    : values.grupo,
						pHojaReport : values.hoja,
						pTypeReport : values.id_report,
						pdbIdSede   : values.id_sede,
						pdbPeriodo  : values.periodo,
						pdbAllPer   : values.allper
					};
				if (btn.itemId === 'btnXls'){
					this.onDownLoadReportXls(btn,url,param);
				} else {
					this.onGenReport(btn,url,param);
				}
				break;
		}
    },

    onDownLoadReportXls: function (btn, url, param) {

		let me = this,
			cUrl = Global.getApiUrl() + '/download/excel/academic-consolidated',
			vMask;

		vMask = btn.up('window');

        if (Ext.isEmpty(vMask)){
            vMask   = btn.up('grid');
        }
		let xFormat = 'xls';
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


        if(!Ext.isEmpty(url) && btn.itemId === 'btnXls') {

            const xParam  = {
				...param,
				pFormat : xFormat,
				...Global.getSchoolParams()
			};

            Ext.Ajax.request({
                timeout : 60000,
                url: cUrl,
                params: xParam,
				headers: {
					'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
				},
                success: function (response) {
					let result = Ext.decode(response.responseText);
                    me.onOpenUrl(result.pathFile);
                },

                failure: function (response) {
                    me.app.onError('No se pueden cargar los datos');
                },

                callback : function (response) {
                    if (!Ext.isEmpty(vMask)) {
                        vMask.el.unmask();
                    }
                }
            });
        }
    }
});
