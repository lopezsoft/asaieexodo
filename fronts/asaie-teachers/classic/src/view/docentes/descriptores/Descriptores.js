/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.view.docentes.Descriptores', {
    extend      : 'Admin.base.WindowCrud',
    title	    : 'Descriptores',
    alias 	    : 'widget.descriptores',
    xtype 	    : 'descriptores',
    controller  : 'logros',
    config      : {
        record  : null
    },
    initComponent: function () {
        var 
            me      = this,
            app     = Admin.getApplication(),
            record  = me.getRecord(),
            url     = Global.getUrlBase () + 'c_sql/get_competencias';
        Ext.Ajax.request({
			url     : url,
			params  : {
				idGrado: record.get('id_grado')
			},
			success: function(response){
				result 	= Ext.decode(response.responseText);
                Global.setCompetences(result.records_comp);
                Global.setScale(result.records_des);
                Global.setColumnsNotes(result.records_colum);
                Global.setDbConfig(result.records_config);
                Global.setConfigReport(Global.getData().config_bol);
			}
        });

        extra = {
			pdbTable	: 'periodos_academicos',
			pdbGrado	: record.get('id_grado'),
			pdbType	    : 0
		};
		app.setParamStore('PeriodosStore', extra);
		extra = {
			pdbTable	: 'competencias',
			pdbGrado	: record.get('id_grado')
		};
		app.setParamStore('CompetenciasDocentesStore',extra);
		app.setParamStore('PeriodosStore', extra);
		extra = {
			pdbTable: 'escala_nacional',
			pdbAll	: 0
		};
		app.setParamStore('EscalaNacionalStore', extra);
        
        this.callParent(arguments);
    },
    buildWindow	: function(){
        var
            me      = this,
            record  = me.getRecord();
        me.setWinObject(Ext.create('Admin.view.docentes.DescriptoresSave'));
        sTitle  = record.get('asignatura') + ' - ' + record.get('grado');
        me.getWinObject().setTitle(sTitle);
	},
    showWindow : function (btn) {
        var 
            me      = this
            data    = me.down('grid').getSelection()[0];

        me.buildWindow();
        form    = me.getWinObject().down('form');
        form.down('#CbEscalaNacional').setHidden(true);
		form.down('#CbEscalaNacional').allowBlank = true;
        form.reset(true);
        if(btn.xtype  == 'editButton'){
            form.loadRecord(data);
            form.down('#CbEscalaNacional').setHidden(false);
			form.down('#CbEscalaNacional').allowBlank = false;
        }
        me.getWinObject().show();
    },
    items : [
        {
            xtype 		: 'customgrid',
            store		: 'LogrosStore',
            plugins: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>',
                        '<p><b>Periodo:</b> {periodo}</p>',
                        '<p><b>Competencia:</b> {competencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: false,
                    independent		: true
                }
            ],
			features: [
				{
					ftype	: 'grouping',
					startCollapsed: true,
					groupHeaderTpl: '<span style="color:#7e55ef;"> <b>' + '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})' + '</b></span>'
				}
			],
            columns: [
                {
                    xtype   : 'rownumberer'
                },
                {
                    text		: "Descripción",
                    flex		: 2,
                    sortable	: true,
                    dataIndex	: 'descripcion',
					menuDisabled: true,
                    filter		: 'string'
                },
                {
                    text        : 'Competencia',
					menuDisabled: true,
                    flex		: 1,
                    sortable	: true,
                    dataIndex	: 'competencia',
                    filter		: 'list'
                },
                {
                    text		: "Periodo",
					menuDisabled: true,
                    width		: 77,
                    sortable	: true,
                    dataIndex	: 'periodo',
                    filter		: 'list'
                },
                {
                    text		: "Desempeño",
					menuDisabled: true,
                    width		: 102,
                    dataIndex	: 'nombre_escala',
                    filter		: 'list',
                    renderer 	:  function(val) {
                        return '<span style="color:#7e55ef;"> <b>' + val + '</b></span>';
                    }
                },
                {
                    text		: "Año",
                    width		: 55,
					menuDisabled: true,
                    dataIndex	: 'year'
                }
            ],
            dockedItems: [
                {
                    xtype : 'toolbarCrud'
                },
                {
                    xtype   : 'customToolbar',
                    items   : [
                        {
                            xtype   : 'customButton',
                            text    : 'Importar - Parcelador',
                            itemId  : 'btnImport',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onViewImport',
                            disabled: true
                        },'-',
                        {
                            xtype   : 'customButton',
                            text    : 'Importar - Banco',
                            itemId  : 'btnImportBanco',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onViewImportBanco',
                            disabled: true
                        },
                        {
                            xtype   : 'customButton',
                            text    : 'Importar - año anterior',
                            itemId  : 'btnImportYear',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onViewImportYear'
                        }
                    ]
                },
                {
                    xtype   : 'pagination',
                    store   : 'LogrosStore',
                    dock    : 'bottom'
                }
            ]
        }
    ]
});
