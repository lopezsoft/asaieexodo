
Ext.define('Admin.view.docentes.RecuperacionesFinalesView',{
    extend	    : 'Admin.base.WindowCrud',
    alias 	    : 'widget.RecuperacionesFinalesView',
    xtype 	    : 'recuperacionesfinales',
    controller  : 'recuperaciones',
    itemId      : 'RecuperacionesFinalesView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Actividades de apoyo de fin de año - '+ Global.getYear());
    },
    alwayOnTop  : true,
    config : {
        maxValue    : 0,
        oldValue    : 0
    },
    items   : [
        {
            xtype   : 'customgrid',
            store   : 'RecuperacionesFinalesStore',
            plugins : [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl: new Ext.XTemplate(
                        '<p><b>Grado:</b> {cod_grado}</p>',
                        '<p><b>Área:</b> {area}</p>',
                        '<p><b>Sede:</b> {sede}</p>'
                    )
                },
                {
                    ptype: 'gridfilters'
                },
                {
                    ptype: 'cellediting',
                    clicksToEdit: 1
                },
				{
					ptype			: 'gridSearch',
					readonlyIndexes	: ['note'],
					disableIndexes	: ['pctChange'],
					mode            : 'local',
					flex			: 1,
					autoFocus		: false,
					independent		: true
				}
            ],
            columns: [
                {
                    xtype: 'rownumberer'
                },
                {
                    text        : 'Nombres y apellidos',
                    width       : 320,
                    dataIndex   : 'estudiante'
                },
                {
                    text        : 'Grado',
                    width       : 65,
                    dataIndex   : 'cod_grado'
                },
                {
                    text        : 'Grupo',
                    width       : 65,
                    dataIndex   : 'grupo',
                    filter: 'list'
                },
                {
                    text        : 'ASIG',
                    width       : 65,
                    dataIndex   : 'abrev',
                    filter: 'list'
                },
                {
                    text        : 'Nota final',
                    width       : 85,
                    dataIndex   : 'notafinal',
                    renderer: function (val) {
                        return '<span style="color:Red;"> <b>' + val + '</b></span>'
                    }
                },
                {
                    text        : 'Recuperación',
                    width       : 110,
                    dataIndex   : 'notarecuperada',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false,
                        selectOnFocus: true,
                        emptyText: '00.00',
                        maskRe: /[\d\.]/
                    },
                    renderer: function (val) {
                        return '<span style="color:Darkviolet;"> <b>' + val + '</b></span>'
                    }
                },
                {
                    text        : 'Fecha',
                    width       : 95,
                    dataIndex   : 'fecha',
                    emptyCellText: '0000-00-00',
                    renderer: Ext.util.Format.dateRenderer('Y-m-d'),
                    field: {
                        xtype: 'datefield',
                        format: 'Y m d'
                    }
                },
                {
                    text        : 'Asignatura',
                    width       : 300,
                    dataIndex   : 'asignatura',
                    filter: 'list'
                },
                {
                    text        : 'Área',
                    width       : 300,
                    dataIndex   : 'area',
                    filter: 'list'
                },
                {
                    text        : 'Sede',
                    width       : 300,
                    dataIndex   : 'sede',
                    filter      : 'list'
                },
                {
                    text        : 'Jornada',
                    width       : 120,
                    dataIndex   : 'jornada',
                    filter      : 'list'
                },
                {
                    xtype       : 'checkcolumn',
                    text        : 'Estado (Activo)',
                    dataIndex   : 'estado',
                    width       : 115,
                    headerCheckbox  : true,
                    stopSelection   : false,
                    editor      : {
                        xtype: 'customcheckboxfield'
                    }
                }
            ],
            listeners: {
                cellclick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					const btn = this.down('#btnPrinter');
					if (btn.isDisabled()) {
                        btn.setDisabled(false);
                    }
                },
                cellkeydown: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					let campo = grid.grid.columns[cellIndex].dataIndex,
						aIndex = -1,
						btn1 = this.down('#saveButton'),
						btn2 = this.down('#undoButton');
					switch (e.getKey()) {
                        case 46 :      // Si presionan la tecla DEL O SUP, se borra el dato.
                            if (cellIndex == 4 || cellIndex == 5) {
                                record.set(campo, '');
                                if (btn1.isDisabled()) {
                                    btn1.setDisabled(false);
                                }
                                if (btn2.isDisabled()) {
                                    btn2.setDisabled(false);
                                }
                            }
                            break;
                        case 65 :		// Si presionan la letra A, reemplaza todos los valores
                            if (cellIndex == 4 || cellIndex == 5) {
                                const aValue = record.get(campo);
                                const aStore = grid.getStore();
                                Ext.each(aStore.data, function () {
                                        aIndex = aIndex + 1;
                                        let aRecord = aStore.getAt(aIndex); // obtenemos el registro
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

                beforeedit: function (editor, e, eOpts) {
                    const
                        me  = e.grid.up('window');
                    e.grid.focus(true, true);
                    const win     = e.grid,
                        btn1    = win.down('#saveButton'),
                        btn2    = win.down('#undoButton');
                    if (btn1.isDisabled()) {
                        btn1.setDisabled(false);
                    }
                    if (btn2.isDisabled()) {
                        btn2.setDisabled(false);
                    }
                    if(me.getOldValue() !== e.record.get('id_grade') ){
                        me.getMaxValueB(e.record.get('id_grade'));
                        me.setOldValue(e.record.get('id_grade'));
                    }
                },

                validateedit : function (ed, e, eOpts) {
					const valuePerdida = parseFloat(e.record.data['notafinal']),
						valueCompare = parseFloat(e.value),
						me = Admin.getApplication(),
						nota_max_rec = e.grid.up('window').getMaxValue();
					if (valueCompare > 0) {
                        if(nota_max_rec > 0){
                            if (valueCompare < valuePerdida) {
                                e.cancel = true;
                                e.record.data[e.field] = parseFloat('0.00');
                                me.showResult('El valor permitido debe ser mayor o igual a la nota perdida');
                            }else if(nota_max_rec > 0){
                                if (valueCompare > nota_max_rec){
                                    e.cancel = true;
                                    e.record.data[e.field] = nota_max_rec;
                                    e.value	= nota_max_rec;
                                    me.showResult('El valor permitido no debe ser mayor que: '+nota_max_rec);
                                }
                            }
                        }else{
                            me.showResult('El valor permitido debe ser mayor o igual a la nota perdida');
                            e.cancel = true;
                            e.record.data[e.field] = parseFloat(0.00);
                        }
                    }
                }
            },
            dockedItems: [
                {
                    xtype: 'toolbarCrud',
                    items: [
                        '->',
                        {
                            xtype       : 'saveButton',
                            handler     : 'onClickSaveFinal',
                            itemId      : 'saveButton'
                        }, '-',
                        {
                            xtype       : 'undoButton',
                            handler     : 'onClickUndoFinal',
                            itemId      : 'undoButton'
                        },'-',
                        {
                            xtype : 'deletebutton'
                        },'-',
                        {
                            xtype   : 'printButton',
                            itemId  : 'btnPrinter'
                        },'-',
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                },
                {
                    xtype: 'pagination'
                }
            ]
        }
    ],

    getMaxValueB: function(id){
		const grados = Global.getGroupGrades(),
			me = this,
			config = Global.getDbConfig();
		me.setMaxValue(0);
        if(grados){
            config.forEach(function(d){
                grados.forEach(function(ele){
                    if(ele.id_grado_agrupado === d.id_grupo_grados && ele.id_grado === id){
                        return me.setMaxValue(parseFloat(d.nota_max_rec));
                    }
                });
            });
        }
    }
});
