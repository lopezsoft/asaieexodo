/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.promocion.NivelacionesFinales',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'ReportesAcademico',
    alias       : 'widget.nivelacionesfinales',
    xtype       : 'nivelacionesfinales',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Nivelaciones finales - '+ Global.getYear());
    },
    items   : [
        {
            xtype	: 'customgrid',
            selModel: 'rowmodel',
            itemId  : 'gridDocente',
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
                    flex			: 1,
                    autoFocus		: true,
                    independent		: true
                }
            ],
            store   : 'DocentesDirGrupoStore',
            columns: [
                {
                    xtype		: 'customrownumberer'
                },
                {
                    text        : 'DOCENTES',
                    dataIndex   : 'nombres',
                    flex        : 1,
                    filter  	: 'string'
                }
            ],
            listeners : {
                'selectionchange': function(grid, selected, eOpts) {
					const me = this;
					if (me.up('window').down('#btnActa')) {
                        me.up('window').down('#btnActa').setDisabled(!selected.length);
                    }
                    if (me.up('window').down('#btnNotas')) {
                        me.up('window').down('#btnNotas').setDisabled(!selected.length);
                    }
                }
            },
            dockedItems : [
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar',
                    dock        : 'bottom',
                    items       : [
                        {
                            xtype       : 'printButton'
                        }
                    ]
                },
                {
                    xtype   : 'customToolbar',
                    dock    : 'bottom',
                    items   :[
						{
							xtype   : 'fieldSet',
							title   : 'Generar el acta para:',
							items   : [
								{
									xtype   : 'customradiogroup',
									itemId  : 'rdgProcess',
									items   : [
										{
											boxLabel    : 'Básica y media',
											name        : 'process',
											checked     : true,
											inputValue  : 5
										},
										{
											boxLabel    : 'Ciclos III y IV',
											name        : 'process',
											inputValue  : 21
										},
										{
											boxLabel    : 'Ciclo V',
											name        : 'process',
											inputValue  : 22
										},
										{
											boxLabel    : 'Ciclo VI',
											name        : 'process',
											inputValue  : 23
										}
									]
								}
							]
						},
                        {
                            xtype   : 'customButton',
                            text    : 'Generar acta',
                            iconCls : 'x-fa fa-spinner',
                            disabled: true,
                            itemId  : 'btnActa',
                            handler : function (btn) {
								const win = btn.up('window'),
									grid = win.down('grid'),
									me = Admin.getApplication();
								win.mask('Generando...');
                                Ext.Ajax.request({
                                    url     : Global.getApiUrl()  +  '/promotion/generate-support-activities',
                                    timeout : 0,
									headers	: {
										'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
									},
                                    params  : {
                                        pdbDocente  : grid.getSelection()[0].get('id_docente'),
                                        pdbProcess 	: win.down('#rdgProcess').getValue(),
										...Global.getSchoolParams()
                                    },
                                    success: function() {
                                        me.showResult('Se ha realizado el proceso correctamente.');
                                    },
                                    failure: function(response) {
										const obj = Ext.decode(response.responseText);
                                        me.onError(obj.message || obj.error || 'Error en el proceso.');
                                    },
                                    callback    : function(res){
                                        win.unmask();
                                    }
                                });
                            }
                        },'-',
                        {
                            xtype   : 'customButton',
                            text    : 'Digitar notas',
                            iconCls : 'x-fa fa-plus',
                            disabled: true,
                            handler : function (btn) {
								const win = btn.up('window'),
									grid = win.down('grid'),
									me = Admin.getApplication();
								const id_grade = win.down('#rdgProcess').getValue();

								win.mask(AppLang.getSMsgLoading());
								const cUrl = Global.getApiUrl() + '/competence/competences';
								Ext.Ajax.request({
									headers: {
										'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
									},
									url: cUrl,
									params : {
										...Global.getSchoolParams(),
										idGrado: id_grade
									},
									success: function(response){
										win.unmask();
										let result = Ext.decode(response.responseText);
										Global.setScale(result.ratingScale);
										Global.setDbConfig(result.generalSetting);
										me.onStore('docentes.RecuperacionesFinalesStore');
										let param = {
											pdbDocente	: grid.getSelection()[0].get('id_docente'),
											pdbTable	: 'respeciales',
											pdbProcess 	: win.down('#rdgProcess').getValue(),
										};
										me.setParamStore('RecuperacionesFinalesStore',param,false);
										Ext.create('Admin.view.docentes.RecuperacionesFinalesView').show();
									},
									failure: function () {
										win.unmask();
										me.onAler('No se pueden cargar los datos');
									}
								});
                            },
                            itemId  : 'btnNotas'
                        }
                    ]
                }
            ]
        }
    ]
});
