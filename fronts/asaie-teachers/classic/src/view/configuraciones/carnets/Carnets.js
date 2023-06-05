
var
	editor  = {
		allowBlank		: false,
		selectOnFocus 	: true
	};
Ext.define('Admin.view.configuraciones.Carnets',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
	alias       : 'widget.carnets',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Carnés Escolares - '+ Global.getYear());
	},
    items       : [
        {
            xtype   		: 'customform',
			showUndoButton	: true,
            items: [
                {
                    xtype       : 'customgrid',
                    store       : 'CarnetsStore',
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
                        }
                    ],
					actions: {
						info: {
							iconCls: 'x-fa fa-pencil',
							tooltip: 'Información adicional',
							handler: function (grid, rowIndex) {
								var rec = grid.getStore().getAt(rowIndex);
								grid.setSelection(rec);
								var 
									win	= Ext.create('Admin.view.configuraciones.CarnetsInfo');
								win.down('form').loadRecord(rec);
								win.show();
							}
						},
						header: {
							iconCls: 'x-fa fa-pencil',
							tooltip: 'Información del encabezado',
							handler: function (grid, rowIndex) {
								var rec = grid.getStore().getAt(rowIndex);
								grid.setSelection(rec);
								var 
									win	= Ext.create('Admin.view.configuraciones.CarnetsHeader');
								win.down('form').loadRecord(rec);
								win.show();
							}
						}
					},
                    columns : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            dataIndex   : 'name',
                            text        : 'Nombre',
                            width       : 80
                        },
						{
							dataIndex	: 'student',
							text		: 'Estudiantil',
							editor		: editor,
							width		: 200
						},
						{
							dataIndex	: 'school',
							text		: 'Institucional',
							editor		: editor,
							width		: 200
						},
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@info']
						},
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@header']
						},
						{
							dataIndex   : 'url',
							text        : 'Imagen',
							width       : 70,
							renderer    : function (val) {
								if(Ext.isEmpty(val)){
									aVal    = Global.getAvatarUnknoun();
								}else {
									aVal    = val
								}
								return '<img alt="{url}" height="48" width="48" src="'+aVal+'"/>';
							}
						},
						{
							dataIndex   : 'url',
							text        : 'Url',
							width       : 80,
							renderer    : function (val) {
								return '<a href="'+aVal+'" target = "_blank">Ver...</a>';
							}
						},
						{
							xtype       : 'checkcolumn',
							text        : 'Mostar QR',
							dataIndex   : 'qr',
							width       : 100
						},
						{
							xtype       : 'checkcolumn',
							text        : 'Activo',
							dataIndex   : 'active',
							width       : 100
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
