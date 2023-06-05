Ext.define('Admin.view.academico.inscripciones.StudentAccess',{
    extend  	: 'Admin.base.WindowCrud',
    alias   	: 'widget.studentaccess',
    xtype   	: 'studentaccess',
    controller	: 'academico',
    initComponent: function () {
        var 
            me  = Admin.getApplication();
        me.onStore('general.perfil.UsersStore');
		me.onStore('inscripciones.StudentAccessStore');
		me.setParamStore('UsersStore',{
			pdbTable    : 'users',
			type		: 5
		});
        this.setTitle('Acceso a los estudiantes');
        this.callParent(arguments);
    },
    showSaveButton  : false,
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
                    title       : 'Permisos',
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
                            store       : 'StudentAccessStore',
                            columns     : [
                                {
                                    xtype   : 'customrownumberer'
                                },
                                {
                                    text        : 'Apellidos y nombres',
                                    dataIndex   : 'nombres',
                                    width       : 300,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Documento',
                                    dataIndex   : 'nro_documento',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
									text        : 'Tiene acceso a',
									columns		: [
										{
											xtype			: 'checkcolumn',
											header			: 'Notas',
											dataIndex		: 'notes',
											headerCheckbox	: true,
											width			: 70,
											stopSelection	: false
										},
										{
											xtype			: 'checkcolumn',
											header			: 'Boletines',
											dataIndex		: 'newsletters',
											headerCheckbox	: true,
											width			: 100,
											stopSelection	: false
										},
										{
											xtype			: 'checkcolumn',
											header			: 'Certificados',
											dataIndex		: 'certificates',
											headerCheckbox	: true,
											width			: 100,
											stopSelection	: false
										},
										{
											xtype			: 'checkcolumn',
											header			: 'Evaluaciones',
											dataIndex		: 'evaluations',
											headerCheckbox	: true,
											width			: 100,
											stopSelection	: false
										},
										{
											xtype			: 'checkcolumn',
											header			: 'Actividades',
											dataIndex		: 'activities',
											headerCheckbox	: true,
											width			: 100,
											stopSelection	: false
										},
										{
											xtype			: 'checkcolumn',
											header			: 'Clases en vivo',
											dataIndex		: 'live_classes',
											headerCheckbox	: true,
											width			: 100,
											stopSelection	: false
										},
										{
											xtype			: 'checkcolumn',
											header			: 'Nivelaciones',
											dataIndex		: 'leveling',
											headerCheckbox	: true,
											width			: 100,
											stopSelection	: false
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
											xtype   : 'saveButton',
											disabled: false,
											handler	: function (btn) {
												let store	= Ext.getStore('StudentAccessStore');
												store.sync();
											}
                                        },'-',
                                        {
											xtype   : 'undoButton',
											disabled: false,
											handler	: function (btn) {
												let store	= Ext.getStore('StudentAccessStore');
												store.rejectChanges();
											}
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
                    title   : 'Inicio de sesión',
                    items: [                        
                        {
                            xtype       : 'customgrid',
                            store       : 'UsersStore',
                            syncHeight  : false,
                            itemId      : 'gridMat',
                            selModel    : 'rowmodel',
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
                            columns     : [
                                {
                                    xtype   : 'customrownumberer',
                                    width   : 25
                                },
                                {
                                    text        : 'Apellidos',
                                    dataIndex   : 'last_name',
                                    width       : 200,
                                    filter      : 'string'
								},
								{
                                    text        : 'Nombres',
                                    dataIndex   : 'names',
                                    width       : 200,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Correo',
                                    dataIndex   : 'email',
                                    width       : 250,
                                    filter      : 'string'
                                },
                                {
                                    text        : 'Usuario',
                                    dataIndex   : 'username',
                                    width       : 120,
                                    filter      : 'string'
                                },
                                {
									text        : 'Activo',
									xtype		: 'checkcolumn',
                                    dataIndex   : 'active',
                                    width       : 90
                                }
                            ],
                            dockedItems : [
                                {
                                    xtype   : 'customToolbar',
                                    items: [
										'->',
										{
											xtype   : 'saveButton',
											disabled: false,
											handler	: function (btn) {
												let store	= Ext.getStore('UsersStore');
												store.sync();
											}
                                        },'-',
                                        {
											xtype   : 'undoButton',
											disabled: false,
											handler	: function (btn) {
												let store	= Ext.getStore('UsersStore');
												store.rejectChanges();
											}
										},
										{
											text    : 'Acceso Estudiantes',
											iconCls : 'x-fa fa-key',
											tooltip : 'Permite generar o reestablecer los datos de acceso al personal estudiantíl.',
											handler : function (btn) {
												var
													me  = Admin.getApplication(),
													ts  = btn.up('window'),
													url = Global.getUrlBase()+'academic/get_update_pass_est';
												ts.mask();
												Ext.Ajax.request({
													url: url,
													success: function(response, opts) {
														me.showResult('Se ha realizado el proceso correntamente');
														let store	= Ext.getStore('UsersStore');
														store.reload();
													},failure: function(response, opts) {
														me.showResult('No se ha realizado el proceso correntamente');
													},callback : function(){
														ts.unmask();
													}
												});
											}
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
    ]
});
