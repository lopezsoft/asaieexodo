/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'nombre'}
    ],
    data : [
        {id: '1',    nombre: 'CONSOLIDADO POR ASIGNATURAS'},
        {id: '2',    nombre: 'CONSOLIDADO POR ÁREAS'},
        {id: '3',    nombre: 'CONSOLIDADO POR DOCENTES'}
    ]
});

Ext.define('Admin.view.general.ConsolidadosReportView',{
    extend  : 'Admin.base.ReportViewBase',
    alias   :'widget.ConsolidadosReportView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleConsolidated() + ' - ' + Global.getYear());
    },
    controller  : 'ReportesGeneral',
    maxHeight      : 500,
    maxWidth       : 650,
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 120
            },
            items   : [
                {
                    xtype   : 'sedesJorn',
                    defaults: {
                        labelWidth  : 120
                    }
                },
                {
                    xtype   : 'CbGrupo'
                },
                {
                    xtype   : 'CbPeriodos',
                    width 	: '100%'
                },
                {
                    xtype       : 'ComboExpand',
                    itemId      : 'comboReport',
                    store       : store,
                    fieldLabel	: 'Tipo de reporte',
                    name		: 'id_report',
                    displayField: 'nombre',
                    valueField	: 'id',
                    reference 	: 'comboReport',
                    publishes   : 'value'
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Orientación',
                    columns     : 2,
                    vertical    : true,
                    labelStyle	: 'font-weight:bold',
                    itemId      : 'hType',
                    items   : [
                        {
                            boxLabel  : 'Vertical',
                            name      : 'hoja',
                            inputValue: '1',
                            checked   : true,
                            itemId    : 'hOfico'
                        },
                        {
                            boxLabel  : 'Horizontal',
                            name      : 'hoja',
                            inputValue: '2',
                            itemId    : 'oCarta'
                        }
                    ]
                },
                {
                    xtype       : 'checkboxgroup',
					columns     : 1,
					vertical	: false,
                    items       : [
                        {
                            boxLabel    : 'Todos los periodos',
                            name        : 'allper',
                            inputValue  : '1',
                            id          : 'checkboxper',
                            reference   : 'allPer',
                            publishes   : 'value'
                        },
						{
							boxLabel    : 'Todos los grupos',
							name        : 'allGroup',
							inputValue  : '1',
							id          : 'checkboxgro',
							reference   : 'allGroup',
							publishes   : 'value'
						}
                    ]
                }
            ],
            dockedItems : []
        }
    ],
    buttons : [
        {
            xtype       : 'customButton',
            text        : AppLang.getSButtonGenerate(),
            formBind    : true,
            handler     : function (btn) {
                var url     = '/reports/generate/consolidated',
                    win     = btn.up('window'),
                    me      = Admin.getApplication(),
                    values  = win.down('form').getValues(),
                    param   = {
                        pdbCodGrado : values.id_grado,
                        pdbIdJorn   : values.cod_jorn,
                        pdbGrupo    : values.grupo,
                        pTypeReport : values.id_report,
                        pdbIdSede   : values.id_sede,
                        pdbPeriodo  : values.periodo,
						allPer		: values.allper ? 1 : 0,
						allGroup	: values.allGroup ? 1 : 0
                    };
                try {
                    win.mask(AppLang.getSSavingChanges());
					const {school, profile}	= AuthToken.recoverParams();
					const dt			= new Date();
					param.schoolId  	= school.id || 0;
					param.profileId   	= profile.id || 0;
					param.year        	= school.year || dt.getFullYear();
                    Ext.Ajax.request({
                        url: Global.getApiUrl() + url,
                        timeout: 6000000,
                        params: param,
						headers: {
							'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
						},
                        success: function (response, opts) {
                            me.showResult(AppLang.getSChangesOk());
                        },
                        failure: function (response, opts) {
                            me.onError('server-side failure with status code ' + response.status);
                        },
                        callback: function (e, r) {
                            win.unmask()
                        }
                    });
                } catch (e) {
					console.log(e);
                    win.unmask();
                }
            }
        },'-',
        {
            xtype       : 'printButton',
            disabled    : false,
            formBind    : true
        }
    ]
});
