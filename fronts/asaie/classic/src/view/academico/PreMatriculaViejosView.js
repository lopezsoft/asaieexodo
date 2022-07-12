/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.view.academico.PreMatriculaViejosView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.PreMatriculaViejosView',
    title   : 'Ficha Pre-Matricula Antiguos',
    initComponent: function () {
        var me  = Admin.getApplication();
        me.onStore('general.SedesStore');
        me.onStore('general.GradosStore');
        me.onStore('general.GrupoStore');
        me.onStore('general.JornadasStore');
        me.onStore('general.MatricularAntiguosStore');
        me.onStore('general.PreMatriculaViejosStore');
        this.callParent(arguments);
        // this.setTitle(AppLang.getSTitleview()+' - '+ Global.getYear());
    },
    controller : 'Academico',
    width   : 800,
    height  : 600,
    maximized   : true,
    items   : [
        {
            xtype   : 'customform',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items   : [
                {
                    xtype       : 'customgrid',
                    plugins		: [
                        {
                            ptype : 'gridfilters'
                        },
                        {
                            ptype : 'responsive'
                        },
                        {
                            ptype			: 'gridSearch',
                            readonlyIndexes	: ['note'],
                            disableIndexes	: ['pctChange'],
                            minChars		: 1,
                            mode            : 'local',
                            flex			: 1,
                            autoFocus		: true,
                            independent		: false
                        }
                    ],
                    iconCls     : '',
                    store       : 'PreMatriculaViejosStore',
                    flex        : 4,
                    title               : '',
                    columns     : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            text        : 'Código',
                            dataIndex   : 'cod_est',
                            width       : 80,
                            filter      : 'string'
                        },
                        {
                            text        : 'Apellidos y nombres',
                            dataIndex   : 'nombres',
                            width       : 300,
                            filter      : 'string'
                        },
                        {
                            text        : 'documento',
                            dataIndex   : 'nro_doc_id',
                            width       : 120,
                            filter      : 'string'
                        },
                        {
                            text        : 'Grado',
                            dataIndex   : 'grado',
                            width       : 250
                        },
                        {
                            text        : 'Direccción',
                            dataIndex   : 'direccion',
                            width       : 250
                        },
                        {
                            text        : 'Teléfono',
                            dataIndex   : 'telefono',
                            width       : 120
                        },
                        {
                            text        : 'Sede',
                            dataIndex   : 'sede',
                            filter      : 'list',
                            width       : 255
                        },
                        {
                            text        : 'Fecha',
                            dataIndex   : 'fecha',
                            width       : 180
                        },
                        {
                            text        : 'Año',
                            dataIndex   : 'año'
                        }
                    ],
                    dockedItems : [
                        {
                            xtype   : 'toolbarCrud',
                            items   : [
                                {
                                    xtype   : 'deletebutton'
                                },'-',
                                {
                                    xtype   : 'closebutton'
                                },'-',
								{
									xtype	: 'customButton',
									iconCls	: 'x-fa fa-check',
									text	: 'Confirmar',
									disabled: true,
									itemId	: 'btnConfirm',
									handler	: function (btn) {
										win	= Ext,create('Admin.view.academico.ConfirmarViejosView');
										win.show();
									}
								},
								'->',
                                {
                                    xtype       : 'customButton',
                                    tooltip     : 'Documentos digitales',
                                    itemId      : 'btnDocDig',
                                    disabled  	: true,
                                    iconCls     : 'x-fa fa-book',
                                    handler     : 'onViewArchivos'
                                }
                            ]
                        },
                        {
                            xtype   : 'customToolbar',
                            items   :[
                                {
                                    xtype   : 'ContainerListData'
                                }
                            ]
                        },
                        {
                            xtype 		: 'pagination',
                            itemId		: 'pToolbar'
                        }
                    ]
                }
            ],
            dockedItems : [
            ]
    }]
});
