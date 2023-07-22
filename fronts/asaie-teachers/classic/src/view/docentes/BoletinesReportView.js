var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'nombre'}
    ],
    data : [
        {id: '1',    nombre: 'BOLETIN POR ÁREAS'},
        {id: '2',    nombre: 'BOLETIN POR ASIGNATURAS'},
        {id: '3',    nombre: 'BOLETIN POR COMPETENCIAS'},
        // {id: '4',    nombre: 'MOD - PROY TRANSVERSALES'},
        {id: '5',    nombre: 'BOLETIN POR ÁREAS MODELO Nº 2'},
        // {id: '6',    nombre: 'BOLETIN POR ASIGNATURAS  MODELO Nº 2'},
       // {id: '7',    nombre: 'BOLETIN POR ÁREAS CON ESTADÍISTICAS'},
       // {id: '8',    nombre: 'BOLETIN POR ASIGNATURAS CON ESTADÍISTICAS'}
       // {id: '9',    nombre: 'BOLETIN POR ÁREAS (SAMAC)'},
        {id: '10',    nombre: 'PRE-INFORME'},
        {id: '11',    nombre: 'NFORME POR DESEMPEÑOS'}
    ]
});

Ext.define('Admin.view.docentes.BoletinesReportView',{
    extend  : 'Admin.base.CustomWindow',
    alias   :'widget.BoletinesReportView',
    title   : 'Reportes',
    controller  : 'Reporboletin',
	requires	: [
		'Admin.combo.CbCargaDocente'
	],
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('docentes.CargaAgrupadaObservadorStore');
        this.setTitle(AppLang.getSTitleNewsletters()+' - ' + Global.getYear());
        this.callParent(arguments);

    },
    items       : [
        {
            xtype: 'customform',
            showSaveButton : false,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items   : [
                {       
                    xtype   : 'form',
                    flex    : 2,
                    ui      : 'panel-white',
                    scrollable : true,
                    items   : [
                        {
                            xtype   : 'fieldset',
                            title   : 'Búsqueda de estudiantes',
                            defaults : {
                                labelWidth	: 110
                            },
                            margin  : 4,
                            items   : [
                                {
                                    xtype   : 'cbCargaDocente'
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
                                    publishes   : 'value',
                                    bind    : {
                                        visible : '{periodo.value}'
                                    }
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
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype   : 'customgrid',
                    store   : 'MatriculadosStore',
                    margin  : '0 1 0 0',
                    flex    : 4,
                    title   : 'CONSULTA',
					autoLoad    : false,
					syncHeight	: false,
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
							const me = this;

							if (me.up('window').down('#ckEst')) {
                                me.up('window').down('#ckEst').setDisabled(!selected.length);
                                if (selected.length === 0){
                                    me.up('window').down('#ckEst').setValue(false);
                                }
                            }
                        }
                    },
                    columns: [
                        {
                            xtype: 'customrownumberer'
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
							minWidth: 200,
                            flex: 1
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
                                        visible : '{cbCargaDocente.value}'
                                    },
                                    handler     : function (btn) {
										const win = btn.up('window') || btn.up('form'),
											me = Admin.getApplication();
										const comboData = win.down('#cbCargaDocente').getSelection();
										const extra   = {
                                            pdbCodGrado : comboData.get('id_grado'),
                                            pdbGrupo    : comboData.get('grupo'),
                                            pdbSede     : comboData.get('id_sede'),
                                            pdbJorn     : comboData.get('id_jorn'),
                                            pdbTable    : 'student_enrollment'
                                        };
                                        me.setParamStore('MatriculadosStore',extra,true);
                                    }
                                },
                                {
                                    xtype   : 'customcheckboxfield',
                                    itemId  : 'ckEst',
                                    boxLabel: 'Imprimir estudiante seleccionado',
                                    disabled: true
                                },
                                {
                                    xtype   : 'printButton',
                                    bind    : {
                                        disabled    : '{!cbCargaDocente.value}'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
