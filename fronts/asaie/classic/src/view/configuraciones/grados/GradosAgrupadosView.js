/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

var
    editor  = {
		xtype			: 'textfield',
        allowBlank		: false,
        selectOnFocus 	: true
    };

Ext.define('Admin.view.configuraciones.GradosAgrupadosView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Grupo de grados académicos',
    controller  : 'configuraciones',
    alias       : 'widget.gradosAgrupadosView',
    items       : [
        {
			xtype   		: 'customform',
			showUndoButton 	: true,
            layout			: 'fit',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'GradosAgrupadosStore',
					actions: {
						sell: {
							tooltip: 'Grados asignados',
							iconCls: 'x-fa fa-pencil',
							handler: function (grid, rowIndex, colIndex) {
								var
									rec 	= grid.getStore().getAt(rowIndex),
									me		= Admin.getApplication();
									me.onMsgClose();
									me.onStore('general.AuxGradosAgrupadosStore');
								var
									param	= me.getParamStore('AuxGradosAgrupadosStore'),
									win		= Ext.create('Admin.view.configuraciones.AuxGradosAgrupadosView');
									param.pdbIdGradoAgrupado = rec.get('id');
									win.show();
							}
						},
						dell: {
							tooltip: 'Eliminar',
							iconCls: 'x-fa fa-minus',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex),
									me	= Admin.getApplication();
								me.onRecordDelete(rec,'GradosAgrupadosStore');
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
                            dataIndex   : 'nombre_grado_agrupado',
                            text        : 'Nombre del grupo de grados',
                            editor      : editor,
                            flex       	: 1
                        },
						{
							menuDisabled	: true,
							sortable		: false,
							dataIndex   	: 'fin_ciclo_escolar',
							text        	: 'Fin ciclo escolar',
							xtype			: 'checkcolumn',
							width			: 120
						},
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@sell']
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
						'validateedit' : function (editor, e, eOpts ) {

						},

						cellkeydown : function ( grid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {

							var campo 	= grid.grid.columns[cellIndex].dataIndex,
								aIndex 	= -1,
								win		= grid.up('window'),
								btn1	= win.down('#btnSave'),
								btn2	= win.down('#btnUndoAs');
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
									if (cellIndex == 4 || cellIndex == 5){
										aValue 	= record.get(campo);

										aStore 	= grid.getStore();

										Ext.each(aStore.data, function() {

												aIndex = aIndex+1;

												aRecord	= aStore.getAt(aIndex) ; // obtenesmos el registros

												aRecord.set(campo, aValue);        // Seteamos los valores de la columna
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
							iconAlign	: 'left',
							handler		: function (btn) {
								var
									win     = btn.up('window'),
									store   = win.down('grid').getStore();
									store.insert(0,{nombre_nivel_agrupado : '***'});
								win.down('grid').setSelection(0);
							}
						},'-',
                        {
                            xtype	: 'saveButton',
                            itemId	: 'btnSave',
                            iconAlign	: 'left',
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
							iconAlign	: 'left',
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
                            xtype	: 'closebutton',
                            itemId	: 'btnUndo',
                            iconAlign	: 'left'
                        }
                    ]
                }
            ]
        }
    ]
});
