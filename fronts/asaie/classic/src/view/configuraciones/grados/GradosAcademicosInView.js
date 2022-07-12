/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

Ext.define('Admin.view.configuraciones.GradosAcademicosInView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.GradosAcademicosInView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(' Grados académicos - '+ Global.getYear());
    },
    items       : [
        {
            xtype   : 'customform',
            layout	: 'fit',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'GradosStore',
                    iconCls     : '',
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
                            dataIndex   : 'grado',
                            text        : 'Nombre del grado',
                            flex       	: 1
                        },
						{
							dataIndex   : 'nombre_nivel',
							text        : 'Nivel académico',
							width      	: 250
						},
						{
							xtype		: 'checkcolumn',
							dataIndex   : 'uso',
							text        : 'Activo',
							width      	: 70,
							disabled	: true
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
                            handler : 'onUpdateGradosAcademicosIn'
                        },'-',
                        {
                            xtype	    : 'closebutton',
                            iconAlign	: 'left'
                        }
                    ]
                }
            ]
        }
    ]
});
