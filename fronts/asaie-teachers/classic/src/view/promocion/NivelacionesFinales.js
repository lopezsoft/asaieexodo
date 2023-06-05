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
                            xtype   : 'customcheckboxfield',
                            boxLabel: 'Nocturna/Fin de semana',
                            itemId  : 'CkNoct'
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
								const {school, profile} = AuthToken.recoverParams();
								const dt	= new Date();
								win.mask('Generando...');
                                Ext.Ajax.request({
                                    url     : Global.getApiUrl()  +  '/promotion/generate-support-activities',
                                    timeout : 0,
									headers	: {
										'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
									},
                                    params  : {
                                        pdbDocente  : grid.getSelection()[0].get('id_docente'),
                                        pdbType     : win.down('#CkNoct').getValue() ? 1 : 0,
										schoolId	: school.id || 0,
										profileId	: profile.id || 0,
										year		: school.year || dt.getFullYear()
                                    },
                                    success: function(response, opts) {
                                        me.showResult('Se ha realizado el proceso correctamente.');
                                    },
                                    failure: function(response, opts) {
                                        me.onError('Error');
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

								me.onStore('docentes.RecuperacionesFinalesStore');
								let param = {
									pdbDocente: grid.getSelection()[0].get('id_docente'),
									pdbTable: 'respeciales'
								};
                                me.setParamStore('RecuperacionesFinalesStore',param,false);
                                Ext.create('Admin.view.docentes.RecuperacionesFinalesView').show();
                            },
                            itemId  : 'btnNotas'
                        }
                    ]
                }
            ]
        }
    ]
});
