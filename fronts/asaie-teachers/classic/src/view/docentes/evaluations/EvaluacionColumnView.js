/**
 * Created by LEWIS on 30/11/2015.
 */
Ext.define('Admin.view.docentes.EvaluacionColumnView',{
    extend : 'Admin.base.WindowCrud',
    alias  	: 'widget.EvaluacionColumnView',
    title	: 'Elegir columna para digitación de notas de la evaluación',
    requires: [
        'Ext.grid.filters.Filters'
    ],
    width	: 750,
    height	: 550,
    closeAction 	: 'hide',
    modal       : true,
    controller  : 'actividades',
    newVal      : false,
    oldIdEval   : 0,
    applyVal    : false,
    items 	: [
        {
            xtype 		: 'customgrid',
			autoLoad	: false,
            store		: 'ColumnDocentesStore',
            title       : 'Configuración de plantilla de notas',
            defaultListenerScope: true,
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
            defaults : {
                sortable : false
            },
            columns: [
                {
                    xtype	: 'customrownumberer'
                },
                {
                    xtype		: 'checkcolumn',
                    header      : 'Asignar fila',
                    dataIndex	: 'evaluacion',
                    sortable    : false,
                    stopSelection: true,
                    listeners   : {
                        beforecheckchange : function (col, rowIndex, checked, record ,e ,eOpts ) {
                            var
                                me          = Admin.getApplication(),
                                newRecord   = col.up('grid').up('window').newVal,
                                oldIdEval   = col.up('grid').up('window').oldIdEval, // Id de la evaluacion
                                oldValue    = record.get('evaluacion'),
                                store       = Ext.getStore('ColumnDocentesStore'),
                                asignOldVal = 0,
                                cancelVal   = false,
                                win     = Ext.ComponentQuery.query('EvaluacionesSaveView')[0];
                            if(record.get('modificable') == 0){
                                cancelVal = true;
                                me.showResult('No se puede establecer una evaluación a esta columna');
                            }else if(record.get('id_evaluacion') > 0 && record.get('evaluacion') && newRecord){
                                cancelVal = true;
                                me.showResult('Esta valor no es modificable, ya está asignado a una evaluación diferecnte');
                            }else if (!newRecord && record.get('id_evaluacion') > 0 && record.get('evaluacion')){
                                if (!(oldIdEval == record.get('id_evaluacion'))){
                                    cancelVal = true;
                                    me.showResult('Esta valor no es modificable, ya está asignado a una evaluación diferecnte');
                                }
                            }
                            if (cancelVal){
                                store.rejectChanges();
                                return false;
                            }else if (!newRecord){ // Editando una evaluacion
                                if (oldValue) {
                                    if(record.get('id_evaluacion') > 0){
                                        Ext.Msg.show({
                                            title	: 'Desvincular evaluación',
                                            message	: 'Desea desvincular la evaluación de esta nota?',
                                            buttons	: Ext.Msg.YESNO,
                                            icon	: Ext.Msg.QUESTION,
                                            fn: function(btn) {
                                                if (btn === 'yes') {
                                                    win.down('#column_nota').setValue('');
                                                    win.down('#id_column_nota').setValue('');
                                                    record.set('id_evaluacion',0);
                                                    record.set('des_evaluacion','');
                                                }else{
                                                    store.rejectChanges();
                                                }
                                            }
                                        });
                                    }
                                }else {
                                    store.findBy(function (r, i) {
                                        if (r.get('id_evaluacion') > 0 && r.get('evaluacion')){
                                            if (r.get('id_evaluacion') == oldIdEval) {
                                                asignOldVal++;
                                            }
                                        }
                                    });
                                    if (asignOldVal > 0) {
                                        me.showResult('Ya está asignada una columna de notas a esta evaluación.');
                                        return false
                                    }else {
                                        index   = store.findBy(function (r, i) {
                                            if(i == record.id){
                                                return true;
                                            }else{
                                                return false;
                                            }
                                        });
                                        value   = '#'+record.get('name_column');
                                        if (!Ext.isEmpty(value)){
                                            win.down('#column_nota').setValue(value);
                                            win.down('#id_column_nota').setValue(record.get('id'));
                                            record.set('estado',true);
                                            record.set('id_evaluacion',oldIdEval);
                                        }else{
                                            me.showResult('No se pudo realizar la acción.');
                                            return false
                                        }
                                    }
                                }
                            }else{ // Creando una evaluacion
                                if (oldValue) {
                                    Ext.Msg.show({
                                        title	: 'Desvincular evaluación',
                                        message	: 'Desea desvincular la evaluación de esta nota?',
                                        buttons	: Ext.Msg.YESNO,
                                        icon	: Ext.Msg.QUESTION,
                                        fn: function(btn) {
                                            if (btn === 'no') {
                                                store.rejectChanges();
                                            }
                                        }
                                    });
                                }else {
                                    store.findBy(function (r, i) {
                                        if (r.get('id_evaluacion') == 0 && r.get('evaluacion')){
                                            asignOldVal++;
                                        }
                                    });
                                    if (asignOldVal > 0) {
                                        me.showResult('Ya está asignada una columna de notas a esta evaluación.');
                                        return false
                                    }else {
                                        index   = store.findBy(function (r, i) {
                                            if(i == record.id){
                                                return true;
                                            }else{
                                                return false;
                                            }
                                        });
                                        value   = '#'+record.get('name_column');
                                        if (!Ext.isEmpty(value)){
                                            win.down('#column_nota').setValue(value);
                                            win.down('#id_column_nota').setValue(record.get('id'));
                                            record.set('estado',true);
                                        }else{
                                            me.showResult('No se pudo realizar la acción.');
                                            return false
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    xtype		: 'checkcolumn',
                    header      : 'Visible',
                    headerCheckbox : false,
                    dataIndex	: 'estado',
                    sortable    : false,
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
                    sortable    : false,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false,
                        selectOnFocus 	: true
                    }
                },
                {
                    text		: "Descripción",
                    width		: 300,
                    dataIndex	: 'descripcion',
                    sortable    : false,
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
                    sortable    : false,
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
                },
                {
                    header      : 'Evaluación asignada',
                    dataIndex	: 'des_evaluacion',
                    sortable    : false,
                    width       : 250
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
                        me          = Admin.getApplication(),
                        newRecord   = e.grid.up('window').newVal,
                        oldIdEval   = e.grid.up('window').oldIdEval,
                        cancelVal   = false;
                    fName	= e.field.toUpperCase();

                    if ((fName == 'PORCENTUAL') && (e.record.get('modificable') > 0)) {
                        if (parseFloat(newValue)> 99) {
                           cancelVal = true;
                            me.showResult('Ha ingresado un valor incorrecto, el valor debe estar entre: 0 y 99');
                        }
                    }else if(e.record.get('modificable') == 0){
                        cancelVal = true;
                        me.showResult('Esta valor no es modificable');
                    }else if(e.record.data['id_evaluacion'] > 0 && e.record.data['evaluacion'] && newRecord){
                        cancelVal = true;
                        me.showResult('Esta valor no es modificable, ya está asignado a una evaluación diferecnte');
                    }else if (!newRecord && e.record.data['id_evaluacion'] > 0 && e.record.data['evaluacion']){
                        if (!(oldIdEval == e.record.data['id_evaluacion'])){
                            cancelVal = true;
                            me.showResult('Esta valor no es modificable, ya está asignado a una evaluación diferecnte');
                        }
                    }
                    if (cancelVal){
                        e.cancel = true;
                        e.record.data[e.field] = oldValue;
                        store.rejectChanges();
                    }
                }
            },
            dockedItems: [
                {
                    xtype: 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype	: 'saveButton',
                            iconAlign	: 'left',
                            itemId      : 'btnAplicar',
                            text        : 'Aplicar',
                            disabled    : false,
                            handler     : function (btn) {
                                btn.up('window').applyVal = true;
                                btn.up('window').hide();
                            }
                        },'-',
                        {
                            xtype	: 'closebutton',
                            itemId	: 'btnUndo',
                            handler : function (btn) {
                                btn.up('window').hide();
                            },
                            iconAlign	: 'left'
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
