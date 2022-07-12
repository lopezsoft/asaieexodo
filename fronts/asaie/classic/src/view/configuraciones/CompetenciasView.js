/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
var
    defaultEditor   = {
        allowBlank		: false,
        selectOnFocus 	: true,
        emptyText		: '00.00',
        maskRe			: /[\d\.]/
    },
	editor  = {
		allowBlank		: false,
		selectOnFocus 	: true
	};
Ext.define('Admin.view.configuraciones.CompetenciasView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
	alias       : 'widget.competenciasView',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Competencias académicas - '+ Global.getYear());
	},
    items       : [
        {
            xtype   : 'customform',
			layout	: 'fit',
			showUndoButton	: true,
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'DimensionesStore',
                    plugins: [
                        {
                            ptype			: 'cellediting',
                            clicksToEdit	: 1,
                            default         : 'textfield',
                            triggerEvent    : 'cellclick'
                        },
                        {
                            ptype           : 'selectionreplicator'
                        },
                        {
                            ptype           : 'clipboard'
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
					actions: {
						col: {
							iconCls: 'x-fa fa-pencil',
							tooltip: 'Columnas de notas',
							handler: function (grid, rowIndex, colIndex) {
								var rec = grid.getStore().getAt(rowIndex),
									me  = Admin.getApplication(),
									extra	= {
										pdbTable 	: 'columnas_notas_competencias',
										pdbId		: rec.get('id_pk')
									};
								grid.setSelection(rec);
								me.onStore('general.ColumnasNotasStore');
								me.onStore('general.ColumnasNotasCompetenciasStore');
								me.setParamStore('ColumnasNotasCompetenciasStore',extra);
								var
									ColumnasNotasStore =  Ext.getStore('ColumnasNotasStore'),
									db		= Global.getDbName(),
									year	= Global.getYear(),
									sSQL	= 'competencias AS t1 LEFT JOIN columnas_notas_competencias AS t2 ON t2.id_competencia = t1.id_pk ',
									socket	= Global.getSocket();
									
								ColumnasNotasStore.reload();
								socket.emit('querySelect',{
									dataName: db,
									table	: sSQL,
									fields	: 't2.*',
									where	: ['t2.id_competencia = t1.id_pk AND t1.id_grado_agrupado = ? AND t1.year = ?'],
									values	: [rec.get('id_grado_agrupado'),year]
								},function(err, result){
									if(err){
										me.onError('ERROR');
									}else{
										Ext.each(result,function (name) {
											var
												remove = ColumnasNotasStore.queryRecords('numero_column',name.numero_column);
											ColumnasNotasStore.remove(remove);
										});
										ColumnasNotasStore.commitChanges();
										win     = Ext.create('Admin.view.configuraciones.ColumnasNotasCompetenciasView');
										win.setTitle('Columnas de notas: '+rec.get('competencia'));
										win.show();
									}
								});
							}
						},
						document: {
							iconCls: 'x-fa fa-paperclip',
							tooltip: 'Cambiar foto',
							handler: function (grid, rowIndex, colIndex) {
								var rec = grid.getStore().getAt(rowIndex),
									me  = Admin.getApplication();
								grid.setSelection(rec);
								me.onStore('general.ProyTransvImageBrowserStore');
								store   = Ext.getStore('ProyTransvImageBrowserStore');
								store.reload({
									callback    : function (r, e) {
										Ext.create('Admin.view.configuraciones.ProyTransvFotoView').show();
									}
								});
							}
						},
						sell: {
							tooltip: 'Asignar grupo de grados',
							iconCls: 'x-fa fa-pencil',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex);
								var
									btn1	= win.down('#btnSave'),
									btn2	= win.down('#btnUndoAs'),
									win2	= Ext.create('Admin.view.configuraciones.GradosCompetenciasView'),
									form	= win2.down('form');
								if (btn1.isDisabled()) {
									btn1.setDisabled(false);
								}
								if (btn2.isDisabled()) {
									btn2.setDisabled(false);
								}
								form.loadRecord(rec);
								win2.show();
							}
						},
						dell: {
							tooltip: 'Eliminar',
							iconCls: 'x-fa fa-minus',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex),
									me	= Admin.getApplication();
								me.onRecordDelete(rec,'DimensionesStore');
							}
						}
					},
                    columns : [
                        {
                            xtype   : 'customrownumberer'
                        },
						{
							dataIndex   : 'id',
							text        : 'Orden',
							editor      : editor,
							width       : 60
						},
                        {
                            dataIndex   : 'competencia',
                            text        : 'Competencia',
                            width       : 300,
                            editor      : editor
                        },
						{
							xtype   : 'actioncolumn',
							width   : 25,
							items   : ['@col']
						},
						{
							dataIndex: 'porcentaje',
							text: 'Porcentaje',
							editor: defaultEditor,
							width: 100
						},
						{
							dataIndex   : 'nombre_grado_agrupado',
							text        : 'Grupo de grados',
							width       : 300
						},
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@sell']
						},
						{
							dataIndex   : 'foto',
							text        : 'Imagen',
							width       : 70,
							renderer    : function (val) {
								if(Ext.isEmpty(val)){
									aVal    = Global.getAvatarUnknoun();
								}else {
									aVal    = val
								}
								return '<img alt="{competencia}" height="48" width="48" src="'+aVal+'"/>';
							}
						},
						{
							xtype   : 'actioncolumn',
							width   : 25,
							items   : ['@document']
						},
						{
							xtype       : 'checkcolumn',
							text        : 'Calificable',
							dataIndex   : 'calificable',
							width       : 100
						},
                        {
                            dataIndex   : 'year',
                            width       : 60,
                            text        : 'Año'
                        },
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@dell']
						}
                    ],
					listeners :{
						beforeedit : function (editor, e, eOpts){
							e.grid.focus(true, true);
							var	win		= e.grid.up('window'),
								btn1	= win.down('#btnSave'),
								btn2	= win.down('#btnUndoAs');
							if (btn1.isDisabled()) {
								btn1.setDisabled(false);
							}

							if (btn2.isDisabled()) {
								btn2.setDisabled(false);
							}

						}
					}
                }
            ],
            dockedItems: [
                {
                    xtype		: 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
						{
							xtype		: 'addButton',
							handler		: function (btn) {
								var
									win     = btn.up('window'),
									store   = win.down('grid').getStore();
								store.insert(0,{competencia : '***'});
								win.down('grid').setSelection(0);
							}
						},'-',
						{
							xtype	: 'saveButton',
							itemId	: 'btnSave',
							handler : function (btn) {
								var
									win     = btn.up('window'),
									store   = win.down('grid').getStore(),
									me      = Admin.getApplication();
								if (store.getModifiedRecords().length > 0) {
									store.sync({
										success : function (res) {
											win.down('#btnUndoAs').setDisabled(true);
											me.showResult('Se han guardado los cambios');
										}
									});
								}else {
									me.showResult('No hay cambios')
								}
							}
						},'-',
						{
							xtype		: 'undoButton',
							itemId		: 'btnUndoAs',
							handler		: function (btn) {
								var
									win     = btn.up('window'),
									store   = win.down('grid').getStore();
								win.down('#btnUndoAs').setDisabled(true);
								win.down('#btnSave').setDisabled(true);
								if (store.getModifiedRecords().length > 0) {
									store.rejectChanges();
								}
							}
						},'-',
                        {
                            xtype	: 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});
