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

Ext.define('Admin.view.configuraciones.EscalaView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.escalaView',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Escala de desempeños - '+ Global.getYear());
	},
    items       : [
        {
			xtype   : 'customform',
			showUndoButton	: true,
            layout	: 'fit',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'EscalaStore',
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
					actions: {
						sell: {
							tooltip: 'Asignar grupo de grados',
							iconCls: 'x-fa fa-pencil',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex),
									me	= Admin.getApplication();
								var
									btn1	= win.down('#btnSave'),
									btn2	= win.down('#btnUndoAs'),
									win2	= Ext.create('Admin.view.configuraciones.GradosEscalaView'),
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
						esc: {
							tooltip: 'Asignar escala nacional',
							iconCls: 'x-fa fa-pencil',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex),
									me	= Admin.getApplication();
								var
									btn1	= win.down('#btnSave'),
									btn2	= win.down('#btnUndoAs'),
									win2	= Ext.create('Admin.view.configuraciones.EscalaNacionalInView'),
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
								me.onRecordDelete(rec,'EscalaStore');
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
							editor      : editor
						},
                        {
                            dataIndex   : 'nombre_escala',
                            text        : 'Desempeño',
							width       : 120
                        },
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@esc']
						},
                        {
                            dataIndex   : 'desde',
                            text        : 'Desde',
                            editor      : defaultEditor,
                            width       : 60
                        },
                        {
                            dataIndex   : 'hasta',
                            text        : 'Hasta',
                            editor      : defaultEditor,
                            width       : 65
                        },
                        {
							dataIndex   : 'abrev',
							text        : 'Abrev',
							width       : 60
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
                            xtype       : 'checkcolumn',
                            text        : 'No aprueba en desempeño',
                            dataIndex   : 'reprueba',
                            width       : 200
                        },
                        {
                            dataIndex   : 'year',
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
							iconAlign	: 'left',
							handler		: function (btn) {
								var
									win     = btn.up('window'),
									store   = win.down('grid').getStore();
								store.insert(0,{periodo : '1'});
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
							xtype	: 'closebutton'
						}
                    ]
                }
            ]
        }
    ]
});
