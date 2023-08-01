Ext.define('Admin.view.academico.ConstanciasView',{
    extend: 'Admin.forms.CustomForm',
    controller  : 'academico',
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('representative.CandidatesSearchStore');
        me.onStore('general.PeriodosStore');
        me.onStore('general.ConstanciasStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewStudyConstancy() + ' - ' + Global.getYear());
    },
    alias       : 'widget.constancias',
    itemId      : 'ConstanciasView',
    showSaveButton : false,
    items : [
        {
            xtype   : 'customgrid',
			selModel: 'rowmodel',
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
                },
				{
					text		: 'Año',
					dataIndex 	: 'year',
					width 		: 60
				}
            ],
			listeners: {
				'selectionchange': function (grid, selected) {
					if (this.down('#btnPrinter')){
						this.down('#btnPrinter').setDisabled(!selected.length);
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
								let me = Admin.getApplication(),
									win = null,
									par = btn.up('form'),
									grid = btn.up('form').down('grid'),
									m = btn.up('form').getItemId();
								grid.mask(AppLang.getSMsgLoading());
								let store = Ext.getStore('ConstanciasStore');
								const param = {
									pdbTable: 'config_const_cert',
									pdbType: 1,
									where: '{"type": "1"}'
								};
                                me.setParamStore(store, param, false);
                                store.reload({
                                    callback: function (r, e) {
										let form;
										try {
											if (r.length > 0) {
												win = Ext.create('Admin.view.academico.ConstanciasSaveView');
												form = win.down('form');
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
                            xtype		: 'printButton',
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
