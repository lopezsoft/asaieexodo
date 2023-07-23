Ext.define('Admin.view.configuraciones.ExtraModulesView', {
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
	alias       : 'widget.extraModulesView',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Módulos extras');
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
                    store       : 'ExtraModulesStore',
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
							dataIndex   : 'module_name',
							text        : 'Nombre del módulo',
							flex       	: 2,
						},
                        {
                            xtype       : 'checkcolumn',
                            text        : 'Activa',
                            dataIndex   : 'is_active',
                            width       : 100
                        },
						{
							xtype       : 'checkcolumn',
							text        : 'Disponible',
							dataIndex   : 'status',
							readOnly    : true,
							disabled    : true,
							width       : 100
						}
                    ]
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
							xtype	: 'saveButton',
							itemId	: 'btnSave',
							iconAlign	: 'left',
							handler : function (btn) {
								const win = btn.up('window'),
									store = win.down('grid').getStore(),
									me = Admin.getApplication();
								if (store.getModifiedRecords().length > 0) {
									win.mask();
									store.sync({
										success : function (res) {
											win.unmask();
											me.showResult('Se han guardado los cambios');
										},
										failure : function (res) {
											win.unmask();
											me.showResult(res.operations[0].error);
										}
									});
								}else {
									me.showResult('No hay cambios');
								}
							}
						},'-',
						{
							xtype		: 'undoButton',
							itemId		: 'btnUndoAs',
							disabled	: false,
							iconAlign	: 'left',
							handler		: function (btn) {
								const win = btn.up('window'),
									store = win.down('grid').getStore();
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
