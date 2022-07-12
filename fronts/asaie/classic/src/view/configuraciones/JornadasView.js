/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

var
    editor  = {
		xtype			: 'textfield',
        allowBlank		: false,
        selectOnFocus 	: true
    };

Ext.define('Admin.view.configuraciones.JornadasView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.jornadas',
    maxHeight	: 450,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewStudyDay()+' - '+ Global.getYear());
    },
    items       : [
        {
            xtype   : 'customform',
            items: [
                {
                    xtype       : 'customgrid',
                    store       : 'JornadasStore',
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
                            dataIndex   : 'jornada',
                            text        : 'Nombre de la jornada',
                            editor      : editor,
                            flex       	: 1
                        },
						{
							xtype       : 'checkcolumn',
							text        : 'Activo',
							dataIndex   : 'estado',
							width       : 70
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
                            itemId      : 'btnUndoAs',
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
