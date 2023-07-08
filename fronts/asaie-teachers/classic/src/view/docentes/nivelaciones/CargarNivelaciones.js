Ext.define('Admin.view.docentes.CargarNivelaciones',{
    extend	: 'Admin.base.WindowCrud',
    alias 	    : 'widget.cargarnivelaciones',
    xtype 	    : 'cargarnivelaciones',
    itemId      : 'cargarnivelaciones',
    controller  : 'recuperaciones',
    config      : {
        record  : null
    },
    store   : 'RecuperacionesPeriodicasStore',
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
                    width 		: 320,
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
                    text 		    : 'Fecha',
                    width 		    : 105,
                    dataIndex	    : 'fecha',
                    emptyCellText	: '0000-00-00',
                    renderer        : Ext.util.Format.dateRenderer('Y-m-d'),
                    field: {
                        xtype: 'datefield',
                        format: 'Y m d'
                    }
                }
            ],
            listeners :{
                'validateedit' : function (editor, e ) {
					const valuePerdida = parseFloat(e.record.data['nota_perdida']),
						valueCompare = parseFloat(e.value),
						nota_max_rec = parseFloat(Global.getDbConfig().nota_max_rec);
					if (valueCompare > 0) {
                        if (valueCompare < valuePerdida ) {
                            e.cancel = true;
                            e.record.data[e.field] = parseFloat('0.00');
                            Admin.getApplication().showResult('El valor permitido debe ser mayor o igual que la nota perdida');
                        }else if(nota_max_rec > 0){
                            if (valueCompare > nota_max_rec){
                                e.cancel = true;
                                e.record.data[e.field] = nota_max_rec;
								e.value	= nota_max_rec;
                                Admin.getApplication().showResult('El valor permitido no debe ser mayor que: '+nota_max_rec);
                            }
                        }
                    }
                },
                cellkeydown : function ( grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
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
                            if (cellIndex === 4 || cellIndex === 5){
                                const aValue 	= record.get(campo);
                                const aStore 	= grid.getStore();
                                Ext.each(aStore.data, function() {
                                        aIndex = aIndex+1;
                                        let aRecord	= aStore.getAt(aIndex) ; // obtenemos el registro
                                        aRecord.set(campo, aValue);        // Seteamos los valores de la columna
                                });
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
                        const win		= e.grid.up('window'),
                        btn1	= win.down('#saveButton'),
                        btn2	= win.down('#undoButton');
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
                            labelAlign	: 'left'
                        },
                        {
                            xtype       : 'customButton',
                            iconCls     : 'x-fa fa-search',
                            handler     : 'onSelectPeriodo',
                            bind        : {
                                disabled    : '{!periodo.value}'
                            }
                        },'-','->',
                        {
                            xtype		: 'saveButton',
                            itemId      : 'saveButton',
                            iconAlign	: 'left'
                        },'-',
                        {
                            xtype		: 'undoButton',
                            iconAlign	: 'left',
                            itemId      : 'undoButton'
                        },'-',
                        {
                            xtype       : 'printButton'
                        },'-',
                        {
                            xtype       : 'closebutton',
                            iconAlign   : 'left'
                        }
                    ]
                },
                {
                    xtype   : 'pagination'
                }
            ]
        }
    ],
    saveData : function(storeName) {
		const win = this,
			grid = win.down('grid'),
			store = Ext.getStore('RecuperacionesPeriodicasStore'),
			btn1 = win.down('#saveButton'),
			btn2 = win.down('#undoButton');
		let modified = store.getModifiedRecords();
        if(!Ext.isEmpty(modified)){
            win.mask('Guardando…');
            store.sync({
                success: function(response){
                    win.unmask();
                    grid.getStore().commitChanges();
                    btn1.setDisabled(true);
                    btn2.setDisabled(true);
                    grid.getStore().reload();
                    Admin.getApplication().showResult('Se han guardado los datos correctamente');
                },
                failure: function (response) {
                    win.unmask();
                    Admin.getApplication().onError(response.responseText);
                }
            });

        }else{
            btn1.setDisabled(true);
            btn2.setDisabled(true);
        }
    }
});
