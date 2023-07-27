Ext.define('Admin.view.promocion.CertificadoFinal',{
    extend  : 'Admin.forms.CustomForm',
    alias   :'widget.certificadofinal',
    xtype   :'certificadofinal',
    title   : 'Reportes',
    itemId  : 'certificadofinal',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Certificado final de promoción - '+ Global.getYear());
    },
    controller  : 'Promocion',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items   : [
        {
            xtype   : 'customcontainer',
            width   : 455,
            items   : [
                {
                    xtype   : 'fieldset',
                    title   : 'Búsqueda de estudiantes',
                    defaults : {
                        labelWidth	: 65
					},
					scrollable	: true,
                    items   : [
                        {
                            xtype   : 'sedesJorn',
                            defaults : {
                                labelWidth	: 65
                            }
                        },
                        {
                            xtype   : 'CbGrupo',
                            bind    : {
                                visible : '{comboGrados.value}'
                            }
                        },
                        {
                            xtype       : 'radiogroup',
                            fieldLabel  : 'Tipo de papel',
                            columns     : 1,
                            vertical    : false,
                            labelStyle	: 'font-weight:bold',
                            items   : [
                                {
                                    boxLabel  : 'Oficio',
                                    name      : 'hoja',
                                    inputValue: '1',
                                },
                                {
                                    boxLabel  : 'Carta',
                                    name      : 'hoja',
                                    checked   : true,
                                    inputValue: '2'
                                }
                            ]
                        },
                        {
                            xtype       : 'radiogroup',
                            fieldLabel  : 'Opciones',
                            columns     : 1,
                            vertical    : false,
                            labelStyle	: 'font-weight:bold',
                            items   : [
                                {
                                    boxLabel  : 'Solo Áreas',
                                    name      : 'tipo',
                                    inputValue: '1',
                                    checked   : true
                                },
                                {
                                    boxLabel  : 'Áreas y asignaturas',
                                    name      : 'tipo',
                                    inputValue: '2'
                                }
                            ]
                        },
                        {
                            xtype       : 'radiogroup',
                            fieldLabel  : 'Tipo',
                            columns     : 1,
                            vertical    : false,
                            labelStyle	: 'font-weight:bold',
                            items   : [
                                {
                                    boxLabel  : 'Modelo #1',
                                    name      : 'modelo',
                                    inputValue: '1',
                                    checked   : true
                                },
                                {
                                    boxLabel  : 'Modelo #2',
                                    name      : 'modelo',
                                    inputValue: '2'
                                }
                            ]
                        },
                        {
                            xtype   : 'customcheckboxfield',
                            boxLabel: 'Aplicar distribución de asignaturas',
                            disabled: true,
                            itemId  : 'CkDistrib'
                        }
                    ]
                }
            ]
        },
        {
            xtype   	: 'customgrid',
            store   	: 'MatriculadosStore',
            flex    	: 4,
            title   	: 'CONSULTA',
			autoLoad    : false,
			syncHeight  : false,
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
                        if (selected.length == 0){
                            me.up('form').down('#ckEst').setValue(false);
                        }
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
					flex: 2,
                    minWidth: 250
                }
            ]
        }
    ],
    dockedItems: [
        {
            xtype: 'toolbarCrud',
            items: [
                '->',
                {
                    xtype       : 'customButton',
                    iconCls     : 'x-fa fa-search',
                    text        : 'Buscar',
                    bind    : {
                        disabled : '{!comboJornadas.value}'
                    },
                    handler     : function (btn) {
                        var
                            ts      = btn.up('form'),
                            me      = Admin.getApplication();
                        extra   = {
                            pdbCodGrado : ts.down('#comboGrados').getValue(),
                            pdbGrupo    : ts.down('#comboGrupo').getValue(),
                            pdbSede     : ts.down('#comboSedes').getValue(),
                            pdbJorn     : ts.down('#comboJornadas').getValue(),
                            pdbTable    : 'matriculas'
                        };
                        me.setParamStore('MatriculadosStore',extra,true);
                    }
                },'-',
                {
                    xtype   : 'customButton',
                    text    : 'Editar encabezado',
                    iconCls : 'x-fa fa-pencil',
                    handler : function (btn) {
                        btn.up('form').getController().redirectTo('encabezadocertificado',true);
                    }
                }
                ,'-',
                {
                    xtype   : 'customButton',
                    text    : 'Generar',
                    iconCls : 'x-fa fa-spinner',
                    handler : function (btn) {
						const me = Admin.getApplication(),
							ts = btn.up('form'),
							values = ts.getValues(),
							param = {
								pdbGrado: ts.down('#comboGrados').getValue(),
								pdbJorn: ts.down('#comboJornadas').getValue(),
								pdbGrupo: ts.down('#comboGrupo').getValue(),
								pdbSede: ts.down('#comboSedes').getValue(),
								pdbAll: 0,
								pdbPer: values.periodo
							};
						const {school, profile} = AuthToken.recoverParams();
						const dt	= new Date();
						param.schoolId	= school.id || 0;
						param.profileId	= profile.id || 0;
						param.year     	= school.year || dt.getFullYear();
						ts.mask('Procesando petición...');
                        Ext.Ajax.request({
                            url     : Global.getApiUrl() + '/promotion/generate-final-report',
                            params  : param,
                            timeout : 0,
							headers : {
								'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
							},
                            success: function(response, opts) {
                                me.showResult('Se ha generado el libro.');
                            },
                            failure: function(response, opts) {
                                console.log('server-side failure with status code ' + response.status);
                            },
                            callback    : function (e, r) {
                               ts.unmask();
                            }
                        });
                    },
                    bind    : {
                        disabled : '{!comboGrupo.value}'
                    }
                },'-',
                {
                    xtype   : 'customcheckboxfield',
                    itemId  : 'ckEst',
                    boxLabel: 'Imprimir selección',
                    disabled: true
                },'-',
                {
                    xtype   : 'printButton',
                    itemId  : 'btnP',
                    bind    : {
                        disabled    : '{!comboGrupo.value}'
                    }
                },
                '-',
                {
                    xtype: 'closebutton'
                }
            ]
        }
    ]
});
