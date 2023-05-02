/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

var
    defaultEditor   = {
		xtype			: 'textfield',
        allowBlank		: false,
        selectOnFocus 	: true,
        emptyText		: '00.00',
        maskRe			: /[\d\.]/
    },
    editor  = {
		xtype			: 'textfield',
        allowBlank		: false,
        selectOnFocus 	: true
    };

Ext.define('Admin.view.configuraciones.PeriodosView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.periodosView',
	requires: [
		'Ext.grid.column.Action'
	],
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Periódos académicos - '+ Global.getYear());
	},
    items       : [
        {
			xtype   : 'customform',
			showUndoButton	:  true,
            layout	: 'fit',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'PeriodosStore',
					actions: {
						sell: {
							tooltip: 'Asignar grupo de grados',
							iconCls: 'x-fa fa-pencil',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex),
									valBlock= rec.get('bloquear'),
									me	= Admin.getApplication();
								if (!valBlock){
									var
										btn1	= win.down('#btnSave'),
										btn2	= win.down('#btnUndoAs'),
										win		= Ext.create('Admin.view.configuraciones.GradosPeriodosView'),
										form	= win.down('form');
									if (btn1.isDisabled()) {
										btn1.setDisabled(false);
									}

									if (btn2.isDisabled()) {
										btn2.setDisabled(false);
									}
									form.loadRecord(rec);
									win.show();
								}
							}
						},
						dell: {
							tooltip: 'Eliminar',
							iconCls: 'x-fa fa-minus',
							handler: function (grid, rowIndex) {
								const rec = grid.getStore().getAt(rowIndex),
									me = Admin.getApplication();
								me.onRecordDelete(rec,'PeriodosStore');
							}
						}
					},
                    plugins: [
                        {
                            ptype           : 'gridfilters'
                        },
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
                    columns : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            dataIndex   : 'periodo',
                            text        : 'Periodo',
                            editor      : editor,
							width       : 75
                        },
                        {
                            dataIndex   : 'descripcion_periodo',
                            text        : 'Descripción del periodo',
                            editor      : editor,
                            width       : 180
                        },
						{
							text		: 'Grupo de grados',
							width		: 250,
							dataIndex 	: 'nombre_grado_agrupado'
						},
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@sell']
						},
						{
							text	: 'Fechas del periodo',
							columns	: [
								{
									dataIndex   : 'fecha_inical',
									text        : 'Inicio',
									emptyCellText	: '0000-00-00',
									renderer		: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									},
									width       : 100
								},
								{
									dataIndex   : 'fecha_cierre',
									text        : 'Corte',
									emptyCellText	: '0000-00-00',
									renderer		: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									},
									width       : 100
								}
							]
						},
						{
							text	: 'Fechas de nivelación',
							columns : [
								{
									dataIndex: 'fecha_inical_nivelacion',
									text: 'Inicio',
									emptyCellText: '0000-00-00',
									renderer: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									},
									width: 100
								},
								{
									dataIndex: 'fecha_cierre_nivelacion',
									text: 'Corte',
									width: 100,
									emptyCellText: '0000-00-00',
									renderer: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									}
								}
							]
						},
                        {
                            text        : 'Porcentaje',
                            dataIndex   : 'porciento',
							editor      : defaultEditor,
                            width       : 100
                        },
						{
							xtype       : 'checkcolumn',
							text        : 'Bloquear',
							dataIndex   : 'bloquear',
							width       : 90,
							listeners   : {
								beforecheckchange : function (col, rowIndex, checked, record ,e ,eOpts ) {
									var
										me          = Admin.getApplication(),
										oldValue    = record.get('bloquear'),
										store       = Ext.getStore('PeriodosStore'),
										win     	= Ext.ComponentQuery.query('PeriodosView')[0];
									if (oldValue){
										store.rejectChanges();
										return false;
									}else{
										Ext.Msg.show({
											title	: 'Bloquear periodo.',
											message	: 'Si bloquea el periodo, luego no podrá modificar ninguna información en el. ¿Desea continuar con la opetación?',
											buttons	: Ext.Msg.YESNO,
											icon	: Ext.Msg.QUESTION,
											fn: function(btn) {
												if (btn === 'yes') {
													record.set('bloquear',1);
													store.sync();
												}else{
													store.rejectChanges();
												}
											}
										});
									}
								}
							}
						},
						{
							xtype       : 'checkcolumn',
							text        : 'Calificable',
							dataIndex   : 'calificable',
							width       : 90
						},
						{
							dataIndex   : 'year',
							text        : 'Año',
							width		: 60
						},
						{
							xtype       : 'checkcolumn',
							text        : 'Activo',
							dataIndex   : 'estado',
							width       : 70
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
						cellkeydown : function ( grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
							let campo = grid.grid.columns[cellIndex].dataIndex,
								aIndex = -1,
								win = grid.up('window'),
								btn1 = win.down('#btnSave'),
								btn2 = win.down('#btnUndoAs');
							switch(e.getKey()){
								case 46 :      // Si presionan la tecla DEL O SUP, se borra el dato.
									if (cellIndex == 4 || cellIndex == 5){
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
									let aValue;
									let aStore;
									if (cellIndex == 4 || cellIndex == 5) {
										aValue = record.get(campo);

										aStore = grid.getStore();

										Ext.each(aStore.data, function () {
												aIndex = aIndex + 1;
											let aRecord = aStore.getAt(aIndex);
												aRecord.set(campo, aValue);
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

						beforeedit : function (editor, e, eOpts){
							e.grid.focus(true, true);
							var	win		= e.grid.up('window'),
								btn1	= win.down('#btnSave'),
								btn2	= win.down('#btnUndoAs'),
								valBlock	= e.record.data['bloquear'];
							if (valBlock){
								var
									store       = Ext.getStore('PeriodosStore');
								store.rejectChanges();
								if (btn1.isDisabled()) {
									btn1.setDisabled(true);
								}

								if (btn2.isDisabled()) {
									btn2.setDisabled(true);
								}
								e.cancel	= true;
								return false;
							}else {
								if (btn1.isDisabled()) {
									btn1.setDisabled(false);
								}

								if (btn2.isDisabled()) {
									btn2.setDisabled(false);
								}
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
							iconAlign	: 'left',
							handler		: function (btn) {
								const win = btn.up('window'),
									store = win.down('grid').getStore();
								const data		= {
									descripcion_periodo	: "DESCRIPCIÓN",
									periodo 			: '1',
									porciento 			: 100,
									estado 				: 1,
									calificable			: 1,
									year				: Global.getSchoolParams().year,
								};
									store.insert(0,data);
								win.down('grid').setSelection(0);
							}
						},'-',
                        {
                            xtype	: 'saveButton',
                            itemId	: 'btnSave',
                            iconAlign	: 'left',
                            handler : function (btn) {
								const win = btn.up('window'),
									store = win.down('grid').getStore(),
									me = Admin.getApplication();
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
								const win = btn.up('window'),
									store = win.down('grid').getStore();
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
