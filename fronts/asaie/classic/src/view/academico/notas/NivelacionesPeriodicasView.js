Ext.define('Admin.view.academico.NivelacionesPeriodicasView',{
    extend	: 'Admin.base.WindowCrud',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Actividades de apoyo periódicas'+' - '+ Global.getYear());
    },
    alias 	    : 'widget.nivelacionesperiodicasview',
    itemId      : 'nivelacionesperiodicasview',
    controller  : 'academico',
    items : [
        {
            xtype		: 'customgrid',
            store		: 'RecuperacionesPeriodicasStore',
            autoLoad	: false,
            plugins		: [
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype           : 'cellediting',
                    clicksToEdit    : 1
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: true,
                    independent		: true
                }
            ],
            columns	: [
                {
                    xtype	: 'customrownumberer'
                },
                {
                    text 		: 'Apellidos y nombres',
                    width 		: 250,
                    dataIndex	: 'nombres',
                    filter		: 'string',
                    locked		: true
                },
                {
                    text 		: 'Grado',
                    width 		: 75,
                    dataIndex	: 'cod_grado'
                },
                {
                    text 		: 'Grupo',
                    width 		: 65,
                    dataIndex	: 'grupo',
                    filter		: 'list'
                },
                {
                    text        : 'Asignatura',
                    width 		: 300,
                    dataIndex	: 'asignatura',
                    filter		: 'list'
                },
                {
                    text 		: 'Per',
					title		: 'Periodo',
                    width 		: 50,
                    dataIndex	: 'periodo'
                },
                {
                    text 		: 'Nota final',
                    width 		: 100,
                    dataIndex	: 'final',
                    renderer 	:  function(val) {
                        return '<span style="color:Red;"> <b>' + val + '</b></span>'
                    }
                },
				{
					text 		: 'Nota perdida',
					width 		: 100,
					dataIndex	: 'nota_perdida',
					renderer 	:  function(val) {
						return '<span style="color:Red;"> <b>' + val + '</b></span>'
					}
				},
                {
                    text 		: 'Recuperación',
                    width 		: 120,
                    dataIndex	: 'nota_habilitacion',
                    editor: {
                        xtype			: 'textfield',
                        allowBlank		: false,
                        selectOnFocus 	: true,
                        emptyText		: '00.00',
                        maskRe			: /[\d\.]/
                    },
                    renderer 	:  function(val) {
                        return '<span style="color:Darkviolet;"> <b>' + val + '</b></span>'
                    }
                },
                {
                    text 		: 'Fecha',
                    width 		: 105,
                    dataIndex	: 'fecha',
                    emptyCellText	: '0000-00-00',
                    renderer: Ext.util.Format.dateRenderer('Y-m-d'),
                    field: {
                        xtype: 'datefield',
                        format: 'Y m d'
                    }
                }
            ],
            listeners :{
                'validateedit' : function (editor, e ) {
					const valuePerdida 	= parseFloat(e.record.data['nota_perdida']),
						valueCompare 	= parseFloat(e.value);
					if (valueCompare > 0) {
                        if (valueCompare < valuePerdida ) {
                            e.cancel = true;
                            e.record.data[e.field] = parseFloat('0.00');
                            Admin.getApplication().showResult('El valor permitido debe ser mayor o igual que la nota perdida');
                        }
                    }
                },

                cellkeydown : function ( grid, td, cellIndex, record, tr, rowIndex, e ) {
					let campo = grid.grid.columns[cellIndex].dataIndex,
						aIndex = -1,
						win = grid.up('window'),
						btn1 = win.down('#saveButton'),
						btn2 = win.down('#undoButton');
					switch(e.getKey()){
                        case 46 :      // Si presionan la tecla DEL O SUP, se borra el dato.
                            if (cellIndex === 4 || cellIndex === 5){
                                record.set(campo,'');
                                if (btn1.isDisabled()) {
                                    btn1.setDisabled(false);
                                }
                                if (btn2.isDisabled()) {
                                    btn2.setDisabled(false);
                                }
                            }
                            break;
                        case 65 :		// Si presionan la letra A, reemplaza todos los valores
							let aValue;
							let aStore;
							if (cellIndex === 4 || cellIndex === 5) {
								aValue = record.get(campo);
								aStore = grid.getStore();
								Ext.each(aStore.data, function () {
										aIndex = aIndex + 1;
									let aRecord = aStore.getAt(aIndex); // obtenesmos el registros
										aRecord.set(campo, aValue);        // Seteamos los valores de la columna
									}
								);
								if (btn1.isDisabled()) {
									btn1.setDisabled(false);
								}
								if (btn2.isDisabled()) {
									btn2.setDisabled(false);
								}
							}
                            break;
                    }

                },

                beforeedit : function (editor, e){
                    e.grid.focus(true, true);
					let win = e.grid.up('window'),
						btn1 = win.down('#saveButton'),
						btn2 = win.down('#undoButton');
                    if (btn1.isDisabled()) {
                        btn1.setDisabled(false);
                    }
                    if (btn2.isDisabled()) {
                        btn2.setDisabled(false);
                    }
                }
            },
            dockedItems	: [
                {
                    xtype   : 'toolbarCrud',
                    items   : [
                        {
                            xtype 		: 'CbPeriodos',
                            labelAlign	: 'top',
                        },
                        {
                            xtype       : 'CbNivelAcademico',
							name        : 'nivel',
							labelAlign	: 'top',
							width 		: 350,
							labelWidth	: 120
                        },
						{
							xtype   : 'fieldSet',
							title   : 'Digitar notas para:',
							items   : [
								{
									xtype   : 'customradiogroup',
									itemId  : 'rdgProcess',
									vertical: false,
									columns: 4,
									items   : [
										{
											boxLabel    : 'Básica y media',
											name        : 'process',
											checked     : true,
											inputValue  : 5
										},
										{
											boxLabel    : 'Ciclos III y IV',
											name        : 'process',
											inputValue  : 21
										},
										{
											boxLabel    : 'Ciclo V',
											name        : 'process',
											inputValue  : 22
										},
										{
											boxLabel    : 'Ciclo VI',
											name        : 'process',
											inputValue  : 23
										}
									]
								}
							]
						},
                        {
                            xtype       : 'customButton',
                            iconCls     : 'x-fa fa-search',
                            handler     : 'onLisActApoyo',
                            bind        : {
                                disabled    : '{!periodo.value}'
                            }
                        },
                        '-','->',
                        {
                            xtype		: 'saveButton',
                            handler     : 'onSaveActApoyo',
                            itemId      : 'saveButton',
                            iconAlign	: 'left'
                        },'-',
                        {
                            xtype		: 'undoButton',
                            handler     : 'onClickUndo',
                            iconAlign	: 'left',
                            itemId      : 'undoButton'
                        },
                        {
                            xtype       : 'closebutton',
                            iconAlign   : 'left'
                        }
                    ]
                },
                {
                    xtype       : 'pagination',
                    showPrint   : true
                }
            ]
        }
    ]
});
