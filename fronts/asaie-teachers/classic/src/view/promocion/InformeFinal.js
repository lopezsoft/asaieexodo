Ext.define('Admin.view.promocion.InformeFinal',{
    extend  : 'Admin.forms.CustomForm',
    alias   :'widget.informefinal',
    xtype   :'informefinal',
    itemId  : 'LibroFinalView',
	requires	: [
		'Admin.combo.CbCargaDocente'
	],
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('docentes.CargaAgrupadaObservadorStore');
        this.setTitle('Informe final de evaluación - '+ Global.getYear());
        this.callParent(arguments);
    },
    controller  : 'Promocion',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items       : [
        {
            xtype   		: 'fieldset',
            title   		: 'Búsqueda de estudiantes',
			width   		: 455,
            defaults : {
                labelWidth	: 65
			},
			scrollable	: true,
            margin  : 4,
            items   : [
				{
					xtype		: 'cbCargaDocente',
				},
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Periodo',
                    columns     : 3,
                    vertical    : true,
                    labelStyle	: 'font-weight:bold',
                    items   : [
                        {
                            boxLabel  : 'Final',
                            name      : 'periodo',
                            inputValue: '1'
                        },
                        {
                            boxLabel  : 'Todos',
                            name      : 'periodo',
                            inputValue: '0',
                            checked   : true
                        }
                    ]
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Tipo de papel',
                    columns     : 2,
                    vertical    : true,
                    labelStyle	: 'font-weight:bold',
                    itemId      : 'hType',
                    items   : [
                        {
                            boxLabel  : 'Hoja oficio',
                            name      : 'hoja',
                            inputValue: '1',
                            checked   : true,
                            itemId    : 'hOfico'
                        },
                        {
                            boxLabel  : 'Hoja carta',
                            name      : 'hoja',
                            inputValue: '2',
                            itemId    : 'oCarta'
                        }
                    ]
                },
                {
                    xtype   : 'customcheckboxfield',
                    boxLabel: 'Generar todos los grupos del grado!',
                    name    : 'all',
                    itemId  : 'ckAll'
                }
            ]
        },
        {
            xtype   	: 'customgrid',
            store   	: 'MatriculadosStore',
            margin  	: '0 1 0 0',
			flex    	: 4,
			syncHeight  : false,
            title   	: 'CONSULTA',
            autoLoad    : false,
            plugins: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl: new Ext.XTemplate(
                        '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                    )
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
            listeners : {
                'selectionchange': function(grid, selected, eOpts) {
                    var me = this;
                    if (me.up('form').down('#ckEst')) {
                        me.up('form').down('#ckEst').setDisabled(!selected.length);
                        if (selected.length === 0){
                            me.up('form').down('#ckEst').setValue(false);
                        }
                    }
                    if (me.up('form').down('#btnObs')) {
                        me.up('form').down('#btnObs').setDisabled(!selected.length);
                    }
                }
            },
            columns: [
                {
                    xtype: 'rownumberer'
                },
                {
                    text: 'Apellidos y Nombres',
                    dataIndex: 'nombres',
                    width: 290
                },
                {
                    text: 'Grado',
                    dataIndex: 'grado',
                    width: 100
                },
                {
                    text: 'Grupo',
                    dataIndex: 'id_group',
                    width: 60
                },
                {
                    text: 'Jornada',
                    dataIndex: 'jornada',
                    width: 120
                },
                {
                    text: 'Sede',
                    dataIndex: 'sede',
                    flex: 1
                }
            ]
        }
    ],
    dockedItems: [{
        xtype		: 'toolbarSave',
        dock        : 'top',
        items       : [
            '->',
            {
                xtype       : 'customButton',
                iconCls     : 'x-fa fa-search',
                text        : 'Buscar',
                bind    : {
                    disabled : '{!cbCargaDocente.value}'
                },
                handler     : function (btn) {
					const win = btn.up('form'),
						me = Admin.getApplication();
					const comboData = win.down('#cbCargaDocente').getSelection();
					let extra = {
						pdbCodGrado	: comboData.get('id_grado'),
						pdbGrado	: comboData.get('id_grado'),
						pdbGrupo	: comboData.get('grupo'),
						pdbSede		: comboData.get('id_sede'),
						pdbJorn		: comboData.get('id_jorn'),
						pdbTable	: 'matriculas'
					};
                    me.setParamStore('MatriculadosStore',extra,true);
                }
            },'-',
            {
                xtype   : 'customButton',
                text    : 'Generar',
                iconCls : 'x-fa fa-spinner',
                handler : function (btn) {
					const me = Admin.getApplication(),
						gb = Global,
						win = btn.up('form'),
						values = win.getValues();
					const comboData = win.down('#cbCargaDocente').getSelection();
					const  param = {
							pdbGrado	: comboData.get('id_grado'),
							pdbJorn		: comboData.get('id_jorn'),
							pdbGrupo	: comboData.get('grupo'),
							pdbSede		: comboData.get('id_sede'),
							pdbAll		: win.down('#ckAll').getValue() ? 1 : 0,
							pdbPer		: values.periodo
						};
					const {school, profile} = AuthToken.recoverParams();
					const dt	= new Date();
					param.schoolId	= school.id || 0;
					param.profileId	= profile.id || 0;
					param.year     	= school.year || dt.getFullYear();
					win.mask('Procesando petición...');
                    Ext.Ajax.request({
                        url     : gb.getApiUrl() + '/promotion/generate-final-report',
                        params  : param,
						headers : {
							'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
						},
                        timeout : 0,
                        success: function(response, opts) {
                            me.showResult('Se ha generado el libro.');
                        },
                        failure: function(response, opts) {
                            console.log('server-side failure with status code ' + response.status);
                        },
                        callback    : function (e, r) {
                            win.unmask();
                        }
                    });
                },
                bind    : {
                    disabled : '{!cbCargaDocente.value}'
                }
            },'-',
            {
                xtype   : 'customcheckboxfield',
                itemId  : 'ckEst',
                boxLabel: 'Imprimir selección.',
                name    : 'selection',
                disabled: true
            },'-',
            {
                xtype   : 'printButton',
                bind    : {
                    disabled    : '{!cbCargaDocente.value}'
                }
            },'-',
            {
                xtype: 'closebutton'
            }
        ]
    }]
});
