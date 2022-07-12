Ext.define('Admin.view.academico.ConstanciasView',{
    extend: 'Admin.forms.CustomForm',
    controller  : 'academico',
    initComponent: function () {
        var me  = Admin.getApplication();
        me.onStore('representative.CandidatesSearchStore');
        me.onStore('general.PeriodosStore');
        me.onStore('general.ConstanciasStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewStudyConstancy() + ' - ' + Global.getYear());
        this.down('#periodo').setHidden(true);
    },
    alias       : 'widget.constancias',
    itemId      : 'ConstanciasView',
    showSaveButton : false,
    items : [
        {
            xtype   : 'customgrid',
            store   : 'CandidatesSearchStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    mode            : 'remote',
                    flex			: 1,
                    autoFocus		: true,
                    independent		: true
                }
            ],
            columns : [
                {
                    xtype       : 'customrownumberer'
                },
                {
                    text        : 'Apellidos y Nombres',
                    dataIndex   : 'nombres',
                    width       : 320,
                    filter      : 'string'
                },
                {
                    text        : 'Grado',
                    dataIndex   : 'grado',
                    width       : 200,
                    filter      : 'list'
                },
                {
                    text        : 'Grupo',
                    dataIndex   : 'id_group',
                    width       : 60,
                    filter      : 'list'
                },
                {
                    text        : 'Estado',
                    dataIndex   : 'estado_mat',
                    width       : 200,
                    filter      : 'list'
                },
                {
                    text        : 'Jornada',
                    dataIndex   : 'jornada',
                    width       : 120,
                    filter      : 'list'
                },
                {
                    text        : 'Sede',
                    dataIndex   : 'sede',
                    width       : 320,
                    filter      : 'list'
                }
            ],
			listeners: {
				'selectionchange': function (grid, selected, eOpts) {
					var me = Admin.getApplication(),
						extra = [];

					if (this.down('#btnPrinter')){
						this.down('#btnPrinter').setDisabled(!selected.length);
					}
					this.down('#periodo').setDisabled(!selected.length);
					if (!Ext.isEmpty(selected)) {
						gdo = selected[0].get('id_grade');
						me.setParamStore('PeriodosStore', {
							pdbTable: 'periodos_academicos',
							pdbGrado: gdo,
							pdbType	: 0
						});
					}

				}
			},
            dockedItems : [
                {
                   xtype    : 'toolbarCrud',
                    items   : [
                        {
                            xtype   : 'customButton',
                            text    : 'Editar encabezado',
                            iconCls : 'x-fa fa-pencil',
                            handler : function (btn) {
                                var
                                    me  = Admin.getApplication(),
                                    win = null,
                                    par = btn.up('form'),
                                    grid= btn.up('form').down('grid'),
                                    m   = btn.up('form').getItemId();
                                grid.mask(AppLang.getSMsgLoading());
                                store = Ext.getStore('ConstanciasStore');
                                if (m == 'CertificadosView') {
                                    param = {
                                        pdbTable: 'config_const_cert',
                                        pdbType: 2
                                    };
                                } else { 
                                    param = {
                                        pdbTable: 'config_const_cert',
                                        pdbType: 1
                                    };
                                }
                                me.setParamStore(store, param, false);
                                store.reload({
                                    callback: function (r, e) {
                                        try {
                                            if (r.length > 0) {
                                                win     = Ext.create('Admin.view.academico.ConstanciasSaveView');
                                                form    = win.down('form');
                                                form.loadRecord(r[0]);
                                                win.setTitle(par.getTitle());
                                                win.show();
                                            } else {
                                                me.onError('Ha ocurrido un error');
                                            }
                                        } catch (e) {
                                            me.onError('Error de aplicación.');
                                        } finally {
                                            grid.unmask();
                                        }
                                    }
                                });
                            }
                        },'-',
                        {
                            xtype       : 'customradiogroup',
                            columns     : 2,
                            vertical    : false,
                            itemId      : 'rdGroup',
                            items       : [
                                {
                                    boxLabel    : 'Modelo1',
                                    name        : 'modelo',
                                    checked     : true,
                                    inputValue  : 1
                                },
                                {
                                    boxLabel    : 'Modelo2',
                                    name        : 'modelo',
                                    inputValue  : 2
                                }
                            ]
                        },'-',
                        {
                            xtype       : 'CbPeriodos',
                            labelAlign  : 'left',
                            width       : 160,
                            hidden      : true,
							disabled	: true
                        },
                        {
                            xtype		: 'printButton',
                            bind        : {
                                disabled    : '{!periodo.value}'
                            }
                        },
                        '->',
                        {
                            xtype: 'closebutton',
                            iconAlign	: 'left'
                        }
                    ]
                },
                {
                    xtype   : 'pagination',
                    items 		: [
                        {
                            xtype       : 'exportButton'
                        }
                    ]
                }
            ]
        }
    ]
});
