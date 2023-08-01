Ext.define('Admin.view.academico.CertificadosView',{
    extend      : 'Admin.forms.CustomForm',
    alias       : 'widget.certificados',
    itemId      : 'CertificadosView',
	controller  : 'academico',
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('representative.CandidatesSearchStore');
        me.onStore('general.PeriodosStore');
		me.onStore('general.ConstanciasStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewStudyCertificates() + ' - ' + Global.getYear());
    },
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
					const me = Admin.getApplication();

					if (this.down('#btnPrinter')){
						this.down('#btnPrinter').setDisabled(!selected.length);
					}
					this.down('#periodo').setDisabled(!selected.length);
					let gdo;
					if (!Ext.isEmpty(selected)) {
						gdo = selected[0].get('id_grade');
						me.setParamStore('PeriodosStore', {
							pdbTable: 'periodos_academicos',
							pdbGrado: gdo,
							pdbType: 0
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
								let me = Admin.getApplication(),
									win = null,
									par = btn.up('form'),
									grid = btn.up('form').down('grid');
								grid.mask(AppLang.getSMsgLoading());
								let store = Ext.getStore('ConstanciasStore');
								const	param = {
										pdbTable: 'config_const_cert',
										pdbType: 2,
										where: '{"type": "2"}'
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
							xtype       : 'CbPeriodos',
							labelAlign  : 'left',
							width       : 160,
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
