Ext.define('Admin.view.general.GenerarCarnets',{
    extend  	: 'Admin.base.WindowCrud',
    alias   	: 'widget.generarcarnets',
    xtype   	: 'generarcarnets',
    controller	: 'ReportesGeneral',
    initComponent: function () {
        var 
            me  = Admin.getApplication();
        me.onStore('admin.ADocentesStore');
        me.onStore('inscripciones.InscripcionesStore');
        this.setTitle('Generación de carnés escolares - ' + Global.getYear());
        this.callParent(arguments);
    },
    items: [
        {
            xtype   : 'customTab',
            frame   : true,
            bodyPadding: 1,
            defaults: {
                scrollable  : false,
                border      : false,
                layout		: 'fit'
            },
            items: [
                {
                    title       : 'Estudiantes',
                    items   : [
                        {
                            xtype       : 'customgrid',
                            itemId      : 'studentgrid',
                            selModel    : 'rowmodel',
                            syncHeight  : false,
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
                                    mode            : 'remote',
                                    flex			: 1,
                                    autoFocus		: true,
                                    independent		: true
                                }
                            ],
                            store       : 'InscripcionesStore',
                            columns     : [
                                {
                                    xtype   : 'customrownumberer'
                                },
                                {
                                    text        : 'Código',
                                    dataIndex   : 'id',
                                    width       : 80,
                                    filter      : 'string'
                                },
								{
									text        : 'Apellidos',
									columns		: [
										{
											text 		: 'Primer',
											dataIndex   : 'apellido1',
											filter      : 'string'
										},
										{
											text 		: 'Segundo',
											dataIndex   : 'apellido2',
											filter      : 'string'
										}
									]
								},
								{
									text        : 'Nombres',
									columns		: [
										{
											text 		: 'Primer',
											dataIndex   : 'nombre1',
											filter      : 'string'
										},
										{
											text 		: 'Segundo',
											dataIndex   : 'nombre2',
											filter      : 'string'
										}
									]
								},
                                {
                                    text        : 'Documento',
                                    dataIndex   : 'nro_documento',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Dirección',
                                    dataIndex   : 'direccion',
                                    width       : 200,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'F. Nacimiento',
                                    dataIndex   : 'fecha_nacimiento',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Edad',
                                    dataIndex   : 'edad',
                                    width       : 55,
                                    filter      : 'string'
                                }
                            ],
                            dockedItems : [
                                {
                                    xtype   : 'toolbarCrud',
                                    items   : [
                                        '->',
                                        {
											xtype	: 'printButton'
										}
                                    ]
                                },
                                {
                                    xtype 		: 'pagination'
                                }
                            ]
                        }                        
                    ]
                },
                {
                    title   : 'Docentes',
                    items: [                        
                        {
                            xtype       : 'customgrid',
                            syncHeight  : false,
                            selModel    : 'rowmodel',
                            plugins		: [
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
                            store       : 'ADocentesStore',
							columns     : [
								{
									xtype   : 'customrownumberer',
									width   : 50
								},
								{
									text        : 'Apellidos',
									columns : [
										{
											text        : 'Primer',
											dataIndex   : 'apellido1',
											width       : 120,
											filter      : 'string'
										},{
											text        : 'Segundo',
											dataIndex   : 'apellido2',
											width       : 120,
											filter      : 'string'
										}
									]
								},
								{
									text        : 'Nombres',
									columns : [
										{
											text        : 'Primer',
											dataIndex   : 'nombre1',
											width       : 120,
											filter      : 'string'
										},{
											text        : 'Segundo',
											dataIndex   : 'nombre2',
											width       : 120,
											filter      : 'string'
										}
									]
								},
								{
									text        : 'Documento',
									dataIndex   : 'documento',
									width       : 120,
									filter      : 'string'
								},
								{
									text        : 'Dirección',
									dataIndex   : 'direccion',
									width       : 250
								},
								{
									text        : 'Sexo',
									dataIndex   : 'sexo',
									filter      : 'list',
									width       : 65
								},
								{
									text        : 'Fecha de nacimiento',
									dataIndex   : 'fecha_nacimiento',
									width       : 180
								},
								{
									text        : 'Edad',
									dataIndex   : 'edad',
									width       : 65
								},
								{
									xtype       : 'checkcolumn',
									text        : 'Activo',
									dataIndex   : 'estado',
									width       : 80,
									disabled    : true
								}
							],
                            dockedItems : [
                                {
                                    xtype   : 'customToolbar',
                                    items: [
                                        '->',
                                        {
                                            xtype   : 'printButton',
                                            itemId	: 'printbutton2'
                                        }
                                    ]
                                },
                                {
                                    xtype   : 'pagination'
                                }
                            ]
                        }
                    ]
                }
            ]
		}
	],
	dockedItems : [
		{
			xtype   : 'toolbarCrud',
			items   : [
				'->',
				{
					xtype   : 'customcheckboxfield',
					itemId	: 'ckAll',
					boxLabel: 'Selección'
				},'-',
				{
					xtype	: 'customcheckboxfield',
					itemId	: 'ckRes',
					boxLabel: 'Con respaldo'
				},'-',
				{
					xtype   : 'closebutton'
				}
			]
		}
	]
});
