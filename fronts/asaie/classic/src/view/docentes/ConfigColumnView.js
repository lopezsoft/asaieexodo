/**
 * Created by LEWIS on 30/11/2015.
 */
Ext.define('Admin.view.docentes.ConfigColumnView',{
    extend : 'Admin.base.WindowCrud',
    alias  	: 'widget.ConfigColumnView',
    requires: [
        'Ext.grid.filters.Filters'
    ],
    controller : 'carga',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Configurar plantilla de notas - '+ Global.getYear());
    },
    maxWidth	: 650,
    modal       : true,
    items 	: [
        {
            xtype 		: 'grid',
            loadmask 	: true,
            autoLoad	: true,
            store		: 'ColumnDocentesStore',
            border		: false,
            columnLines : true,
            allowDeselect : true,
            plugins		: [
                {
                    ptype			: 'cellediting',
                    clicksToEdit	: 1,
                    id              : 'CellEdit'
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            features: [{
                ftype   :'groupingsummary',
                startCollapsed: true,
                groupHeaderTpl: '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
            }],
            columns: [
                {
                    xtype	: 'customrownumberer'
                },
                {
                    xtype		: 'checkcolumn',
                    header      : 'Visible',
                    headerCheckbox : true,
                    dataIndex	: 'activa',
                    filter		: 'list',
                    stopSelection: false,
                    listeners   : {
                        beforecheckchange : function (col, rowIndex, checked, record ,e ,eOpts ) {
                            if (record.get('evaluacion')){
                                return false;
                            }
                        }
                    }
                },
                {
                    text		: "Nombre",
                    width		: 90,
                    dataIndex	: 'nombre',
                    filter		: 'list',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false,
                        selectOnFocus 	: true
                    }
                },
                {
                    text		: "Descripción",
                    flex		: 1,
                    dataIndex	: 'descripcion',
                    filter		: 'list',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false,
                        selectOnFocus 	: true
                    }
                },
                {
                    text		: "Por ciento",
                    widt		: 80,
                    dataIndex	: 'porcentual',
                    filter		: 'list',
                    summaryType : 'sum',
                    summaryRenderer: function(value, summaryData, dataIndex) {
                        return value + ' %';
                    },
                    editor: {
                        xtype           : 'textfield',
                        allowBlank      : false,
                        selectOnFocus 	: true,
                        emptyText		: '00.00',
                        maskRe			: /[\d\.]/
                    }
                }
            ],
            listeners: {
                cellkeydown : function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
                    if ((cellIndex > 0 && cellIndex < 4)) {
                        var campo 	= grid.grid.columns[cellIndex].dataIndex,
                            aIndex 	= -1,
                            win		= grid.up('window'),
                            column  = grid.grid.columns[cellIndex];

                        var xStore  = Ext.getStore('ColumnDocentesStore'),
                            xCountS = xStore.getCount() - 1;

                        switch (e.getKey()) {
                            case 38 : // Flecha arriba KeyUp
                                if ((rowIndex - 1) >= 0) {
                                    var
                                        grilla = win.down('grid'),
                                        editor = grilla.getPlugin('CellEdit');
                                    grilla.setSelection(rowIndex - 1);
                                    editor.startEditByPosition({
                                        row: rowIndex - 1,
                                        column: cellIndex
                                    });
                                    editor.startEdit(rowIndex - 1, column);
                                }
                                break;
                            case 40 : // Flecha abajo KeyDown
                                if ((rowIndex + 1) <= xCountS) {
                                    var
                                        grilla = win.down('grid'),
                                        editor = grilla.getPlugin('CellEdit');
                                    grilla.setSelection(rowIndex + 1);

                                    editor.startEditByPosition({
                                        row: rowIndex + 1,
                                        column: cellIndex
                                    });
                                    editor.startEdit(rowIndex + 1, column);
                                }
                                break;
                        }
                    }
                },
                'validateedit' : function (editor, e, eOpts ) {
                    var
                        oldValue    = (e.record.data[e.field]),
                        newValue    = e.value,
                        store       = Ext.getStore('ColumnDocentesStore'),
                        me          = Admin.getApplication();
                    	fName		= e.field.toUpperCase();
                    if ((fName == 'PORCENTUAL') && (e.record.get('modificable') > 0)) {
                        if (parseFloat(newValue)> 99) {
                            e.cancel = true;
                            e.record.data[e.field] = oldValue;
                            me.showResult('Ha ingresado un valor incorrecto, el valor debe estar entre: 0 y 99');
                        }
                    }else if(e.record.get('modificable') == 0){
                        e.cancel = true;
                        e.record.data[e.field] = oldValue;
                        store.rejectChanges();
                        me.showResult('Esta valor no es modificable');
                    }

                }
            },
            dockedItems: [
                {
                    xtype: 'toolbarSave',
                    frmBind	: false,
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype	    : 'saveButton',
                            handler     : 'onConfigSave',
                            disabled    : false
                        },'-',
                        {
                            xtype	: 'closebutton'
                        }
                    ]
                },
                {
                    xtype 			: 'pagination',
                    displayInfo		: false
                }
            ]
        }
    ]
});
