/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.admin.NivelesSedesView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'admin',
    alias       : 'widget.NivelesSedesView',
	height	    : '100%',
	requires: [
		'Admin.store.admin.NivelesSedesStore'
	],
	initComponent : function(){
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleViewStudyLevels());
	},
	buildWindow : function(){
		var
			me	= this.getApp();
		me.onStore('general.NivelesAcademicosStore');
		this.winObject = Ext.create('Admin.view.admin.NivelesSedesInView');
	},
	showWindow : function(btn){
		var me 	= this.app,
			ts	= this,
			data = ts.down('grid').getSelection()[0],
			form = [];
		Ext.require([
			'Admin.store.general.NivelesAcademicosStore',
			'Admin.view.admin.NivelesSedesInView'
		]);

		Ext.onReady(function() {
			if (!ts.getWinObject()){
				ts.buildWindow();
			}
			if (btn.itemId == 'editButton'){
				form = ts.winObject.down('form');
				form.loadRecord(data);
			};
			ts.winObject.show();
		});
	},
    items       : [
        {
            xtype   : 'customform',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'NivelesSedesStore',
					actions: {
						sell: {
							tooltip: 'Eliminar',
							iconCls: 'x-fa fa-minus',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex),
									me	= Admin.getApplication();
								me.onRecordDelete(rec,'NivelesSedesStore');
							}
						}
					},
                    plugins: [
                        {
                            ptype           : 'gridfilters'
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
                            dataIndex   : 'sede',
                            text        : 'Nombre de la sede',
                            flex       	: 1
                        },
						{
							dataIndex   : 'nivel',
							text        : 'Nombre del nivel',
							flex       	: 1
						},
						{
							menuDisabled	: true,
							sortable		: false,
							xtype			: 'actioncolumn',
							width			: 25,
							items			: ['@sell']
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
							xtype		: 'addButton',
							iconAlign	: 'left',
							text		:  AppLang.getSButtonStudyLevels()
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
