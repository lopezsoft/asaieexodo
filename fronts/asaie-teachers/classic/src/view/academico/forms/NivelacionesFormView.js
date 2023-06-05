Ext.define('Admin.view.academico.forms.NivelacionesFormView',{
    extend	: 'Admin.base.WindowCrud',
    width	: 700,
    height	: 550,
    maximized : true,
    requires: [
        'Admin.store.docentes.RecuperacionesPeriodicasStore'
    ],
    itemId      : 'NivelacionesFormView',
    alias 	    : 'widget.NivelacionesFormView',
    controller  : 'academico',
    items : [
        {
            xtype		: 'customgrid',
            iconCls     : '',
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
                    text 		: 'Periodo',
                    width 		: 90,
                    dataIndex	: 'periodo'
                },
                {
                    text 		: 'Nota perdida',
                    width 		: 115,
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
                'validateedit' : function (editor, e, eOpts ) {
                    var
                        valuePerdida    = parseFloat(e.record.data['nota_perdida']),
                        valueCompare    = parseFloat(e.value);
                    if (valueCompare > 0) {
                        if (valueCompare < valuePerdida ) {
                            e.cancel = true;
                            e.record.data[e.field] = parseFloat(0.00);
                            Admin.getApplication().showResult(Global.getSInvalidLeveling());
                        }
                    }
                },

                cellkeydown : function ( grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
                    var campo 	= grid.grid.columns[cellIndex].dataIndex,
                        aIndex 	= -1,
                        win		= grid.up('window'),
                        btn1	= win.down('#saveButton'),
                        btn2	= win.down('#btnUndoAs');
                    switch(e.getKey()){
                        case 46 :      // Si presionan la tecla DEL O SUP, se borra el dato.
                            if (cellIndex == 4 || cellIndex == 5){
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
                            if (cellIndex == 4 || cellIndex == 5){
                                aValue 	= record.get(campo);
                                aStore 	= grid.getStore();
                                Ext.each(aStore.data, function() {
                                        aIndex = aIndex+1;
                                        aRecord	= aStore.getAt(aIndex) ; // obtenesmos el registros
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

                beforeedit : function (editor, e, eOpts){
                    e.grid.focus(true, true);
                        win		= e.grid.up('window'),
                        btn1	= win.down('#saveButton'),
                        btn2	= win.down('#btnUndoAs');
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
                            xtype 		: '.ComboPeriodos',
                            labelAlign	: 'left'
                        },
                        {
                            xtype       : '.ComboNivelAcademico',
							name        : 'nivel',
							labelAlign	: 'left',
							width 		: 350,
							labelWidth	: 120
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
                    xtype   : 'pagination',
                    showPrint : true
                }
            ]
        }
    ]
});
