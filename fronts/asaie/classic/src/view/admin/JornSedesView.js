/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

Ext.define('Admin.view.admin.JornSedesView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'admin',
    alias       : 'widget.JornSedesView',
	height	    : '100%',
	width	    : 650,
	requires: [
		'Admin.store.admin.JornSedesStore'
	],
	initComponent : function(){
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleViewStudyDay());
	},
	buildWindow : function(){
		var
			me	= this.getApp();
		me.onStore('general.JornadasStore');
		this.winObject = Ext.create('Admin.view.admin.JornSedesInView');
	},
	showWindow : function(btn){
		var 
			ts	= this;
		Ext.require([
			'Admin.view.admin.JornSedesInView',
			'Admin.store.general.JornadasStore'
		]);

		Ext.onReady(function() {
			if (!ts.getWinObject()){
				ts.buildWindow();
			}
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
                    store       : 'JornSedesStore',
                    iconCls     : '',
					actions: {
						sell: {
							tooltip: 'Eliminar',
							iconCls: 'x-fa fa-minus',
							handler: function (grid, rowIndex, colIndex) {
								var	
									rec 	= grid.getStore().getAt(rowIndex),
									me	= Admin.getApplication();
								me.onRecordDelete(rec,'JornSedesStore');
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
							dataIndex   : 'jornada',
							text        : 'Nombre de la jornada',
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
							text		: AppLang.getSButtonStudyDay()
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
