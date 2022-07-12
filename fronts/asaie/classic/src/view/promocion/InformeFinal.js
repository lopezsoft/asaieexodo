Ext.define('Admin.view.promocion.InformeFinal',{
    extend  : 'Admin.forms.CustomForm',
    alias   :'widget.informefinal',
    xtype   :'informefinal',
    itemId  : 'LibroFinalView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Informe final de evaluación - '+ Global.getYear());
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
                        if (selected.length == 0){
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
                    width: 190
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
                text        : 'Búscar',
                bind    : {
                    disabled : '{!comboJornadas.value}'
                },
                handler     : function (btn) {
                    var
                        win     = btn.up('form'),
                        me      = Admin.getApplication();
                    extra   = {
                        pdbCodGrado : win.down('#comboGrados').getValue(),
                        pdbGrupo    : win.down('#comboGrupo').getValue(),
                        pdbSede     : win.down('#comboSedes').getValue(),
                        pdbJorn     : win.down('#comboJornadas').getValue(),
                        pdbTable    : 'matriculas'
                    };
                    me.setParamStore('MatriculadosStore',extra,true);
                }
            },'-',
            {
                xtype   : 'customButton',
                text    : 'Generar',
                iconCls : 'x-fa fa-spinner',
                handler : function (btn) {
                    var
                        me  = Admin.getApplication(),
                        gb  = Global,
                        win = btn.up('form'),
                        values  = win.getValues(),
                        param   = {
                            pdbGrado    : win.down('#comboGrados').getValue(),
                            pdbJorn     : win.down('#comboJornadas').getValue(),
                            pdbGrupo    : win.down('#comboGrupo').getValue(),
                            pdbSede     : win.down('#comboSedes').getValue(),
                            pdbAll      : win.down('#ckAll').getValue() ? 1 : 0,
                            pdbPer      : values.periodo
                        };
                    win.mask('Procesando petición...');
                    Ext.Ajax.request({
                        url     : gb.getUrlBase() + 'reports/get_generate_libro',
                        params  : param,
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
                    disabled : '{!comboJornadas.value}'
                }
            },'-',
            {
                xtype   : 'customButton',
                iconCls : 'x-fa fa-plus',
                text    : 'Observaciones',
                itemId  : 'btnObs',
                disabled: true,
                handler : function (btn) {
                    var
                        me = Admin.getApplication(),
                        store    = '',
                        win  = btn.up('form'),
                        grid = win.down('grid');
               
                    store   = Ext.getStore('ActaPromoObsStore');
                    param   = {
                        pdbTable    : 'acta_promocion',
                        where       : '{"id_matric": '+ grid.getSelection()[0].get('id') + '}'
                    };
                    me.setParamStore('ActaPromoObsStore',param,false);
                    win.mask();
                    store.load({
                        callback: function (r) {
                            win.unmask();
                            if (r.length > 0){
                                win = Ext.create('Admin.view.promocion.ObservacionFinalView');
                                form= win.down('form');
                                form.loadRecord(r[0]);
                                win.show();
                            }else {
                                me.showResult('El estudiante no tiene acta de promoción.');
                            }
                        }
                    });
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
                    disabled    : '{!comboJornadas.value}'
                }
            },'-',
            {
                xtype: 'closebutton'
            }
        ]
    }]
});
