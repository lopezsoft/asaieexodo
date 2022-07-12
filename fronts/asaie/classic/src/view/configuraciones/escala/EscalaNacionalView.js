
var
    editor  = {
        allowBlank		: false,
        selectOnFocus 	: true
    };

Ext.define('Admin.view.configuraciones.EscalaNacionalView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
	alias       : 'widget.escalaNacionalView',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Escala nacional');
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
                    store       : 'EscalaNacionalStore',
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
                            dataIndex   : 'nombre_escala',
                            text        : 'Nombre de la escala',
							flex       	: 1,
							editor		: editor
                        },
						{
							dataIndex   : 'mensaje',
							text        : 'Mensaje',
							flex       	: 2,
							editor		: editor
						},
						{
							dataIndex   : 'mensaje_boletines',
							text        : 'Mensaje Boletines',
							flex       	: 2,
							editor		: editor
						},
                        {
							dataIndex   : 'abrev',
							text        : 'Abrev',
							width       : 60,
							editor		: editor
						},
                        {
                            xtype       : 'checkcolumn',
                            text        : 'Activa',
                            dataIndex   : 'estado',
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
							xtype		: 'addButton',
							iconAlign	: 'left',
							handler		: function (btn) {
								var
									win     = btn.up('window'),
									store   = win.down('grid').getStore();
								store.insert(0,{nombre_escala : 'NOMBRE ESCALA'});
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
