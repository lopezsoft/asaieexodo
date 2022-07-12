/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
var
	editor  = {
		allowBlank		: false,
		selectOnFocus 	: true,
		completeOnEnter	: true
	};

Ext.define('Admin.view.configuraciones.ColumnasNotasCompetenciasView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Columnas de notas',
    controller  : 'configuraciones',
    alias       : 'widget.columnasNotasCompetenciasView',
    items       : [
        {
            xtype   : 'form',
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
            items: [
                {
                    xtype       : 'customgrid',
					reference	: 'grid1',
					selModel	: 'rowmodel',
					autoLoad	: false,
                    columnLines : true,
                    store       : 'ColumnasNotasStore',
                    title		: 'Columnas disponibles',
                    plugins		: [],
					viewConfig: {
                    	enableTextSelection	: true,
						markDirty			: true,
						plugins: {
							ptype: 'gridviewdragdrop',
							containerScroll: true,
							dragGroup: 'dd-grid-to-grid-group1',
							dropGroup: 'dd-grid-to-grid-group2'
						},
						listeners: {
							drop: function (node, data, dropRec, dropPosition) {
								var
									data 	= data.records[0],
									remove	= data.removedFrom,
									storeS	= Ext.getStore('ColumnasNotasCompetenciasStore');
								storeS.remove(remove);
								storeS.sync();
							}
						}
					},
					width		: 220,
					multiSelect	: false,
                    columns : [
						{
							xtype   : 'customrownumberer'
						},
						{
							dataIndex   : 'numero_column',
							text        : '#',
							width       : 40
						},
						{
							dataIndex   : 'name',
							text        : 'Nombre',
							width       : 145
						}
                    ],
					margin		: '1 1 1 1',
					dockedItems: [

					]
                },
				{
					xtype       : 'customgrid',
					columnLines : true,
					selModel	: 'rowmodel',
					store       : 'ColumnasNotasCompetenciasStore',
					title		: 'Columnas en uso',
					reference	: 'grid2',
					flex		: 1,
					stripeRows: true,
					margin		: '1 1 1 1',
					plugins: [
						{
							ptype			: 'cellediting',
							clicksToEdit	: 1,
							default         : 'textfield',
							triggerEvent    : 'cellclick'
						}
					],
					viewConfig: {
						plugins: {
							ptype: 'gridviewdragdrop',
							containerScroll: true,
							dragGroup: 'dd-grid-to-grid-group2',
							dropGroup: 'dd-grid-to-grid-group1',

							// The right hand drop zone gets special styling
							// when dragging over it.
							dropZone: {
								overClass: 'dd-over-gridview'
							}
						},
						listeners: {
							beforeedit :function ( editor , e ) {
								e.record.commit();
								console.log(1)
							},
							drop:  function (node, data, dropRec, dropPosition) {
								var
									storeS	= Ext.getStore('ColumnasNotasCompetenciasStore'),
									values	= {},
									data	= data.records[0].data,
									extra	= Admin.getApplication().getParamStore('ColumnasNotasCompetenciasStore');
								values	= {
									id_competencia	: extra.pdbId,
									numero_column	: data.numero_column,
									porciento		: 0,
									descripcion		: '',
									tipo			: 'NOTA'
								};
								storeS.insert(0,values);
								storeS.sync({
									callback	: function (res, req) {
										storeS.reload();
									}
								});
							}
						}
					},
					tools: [{
						type	: 'refresh',
						tooltip	: 'Reset both grids',
						handler	: function (btn) {
							var
								storeS	= Ext.getStore('ColumnasNotasCompetenciasStore');
							storeS.reload();
						}
					}],
					listeners: {
						beforeedit :function ( editor , e ) {
							var
								grid = e.grid;
							grid.down('#undoButton').setDisabled(false);
							grid.down('#saveButton').setDisabled(false);
						}
					},
					columns : [
						{
							xtype   : 'customrownumberer'
						},
						{
							dataIndex   : 'numero_column',
							text        : '#',
							width       : 40
						},
						{
							dataIndex   : 'name',
							text        : '',
							width       : 45
						},
						{
							dataIndex   : 'porciento',
							text        : '%',
							width       : 50,
							editor		:  {
								allowBlank		: true,
								selectOnFocus 	: true,
								completeOnEnter	: true
							}
						},
						{
							dataIndex   : 'descripcion',
							text        : 'Descripción',
							width       : 200,
							editor		: {
								allowBlank		: true,
								selectOnFocus 	: true,
								completeOnEnter	: true
							}
						},
						{
							dataIndex   : 'abrev',
							text        : 'ABREV',
							width       : 70,
							editor		:  {
								allowBlank		: true,
								selectOnFocus 	: true,
								completeOnEnter	: true
							}
						},
						{
							dataIndex   : 'tipo',
							text        : 'Tipo',
							width       : 120,
							xtype		: 'widgetcolumn',
							editor		: {
								xtype			: 'combo',
								allowBlank		: false,
								selectOnFocus 	: true,
								completeOnEnter	: true
							},
							widget		: {
								xtype: 'combo',
								bind: '{record.tipo}',
								store: [
									'NOTA','PROM','PORC'
								]
							}
						},
						{
							xtype       : 'checkcolumn',
							text        : 'Modificable',
							dataIndex   : 'modificable',
							width       : 100
						}
					],
					dockedItems: [
						{
							xtype 		: 'toolbarCrud',
							items 		: [
								,'->',
								{
									xtype	: 'saveButton',
									handler	: function (btn) {
										var
											storeS	= Ext.getStore('ColumnasNotasCompetenciasStore');
										storeS.sync();
										btn.setDisabled(true);
										btn.up('window').down('#undoButton').setDisabled(true);
										storeS.reload();
									}
								},'-',
								{
									xtype	: 'undoButton',
									handler	: function (btn) {
										var
											storeS	= Ext.getStore('ColumnasNotasCompetenciasStore');
										storeS.rejectChanges();
										btn.setDisabled(true);
										btn.up('window').down('#saveButton').setDisabled(true);
										storeS.reload();
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
        }
    ]
});
