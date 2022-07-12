/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

Ext.define('Admin.view.configuraciones.AuxGradosAgrupadosView',{
    extend  : 'Admin.base.WindowCrud',
	controller  : 'configuraciones',
	alias       : 'widget.AuxGradosAgrupadosView',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Grupo de grados - '+ Global.getYear());
	},
	store		: 'AuxGradosAgrupadosStore',
    items       : [
        {
            xtype   : 'customform',
            layout	: 'fit',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'AuxGradosAgrupadosStore',
                    iconCls     : '',
					actions: {
						sell: {
							tooltip: 'Eliminar',
							iconCls: 'x-fa fa-minus',
							handler: function (grid, rowIndex, colIndex) {
								var	win		= grid.up('window'),
									rec 	= grid.getStore().getAt(rowIndex),
									me	= Admin.getApplication();
								me.onRecordDelete(rec,'AuxGradosAgrupadosStore');
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
                            dataIndex   : 'nombre_grado_agrupado',
                            text        : 'Nombre del grupo de grados',
                            flex       	: 1
                        },
						{
							dataIndex   : 'grado',
							text        : 'Nombre del grado',
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
							text		: 'Agregar grados académicos',
							handler		: function (btn) {
								var
									me	= Admin.getApplication();
								me.onStore('general.GradosStore');
								Ext.create('Admin.view.configuraciones.GradosAcademicosInView').show();
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
