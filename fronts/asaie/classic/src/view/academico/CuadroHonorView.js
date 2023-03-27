/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.view.academico.CuadroHonorView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.CuadroHonorView',
    itemId  : 'CuadroHonorView',
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('general.PeriodosStore');
        me.onStore('general.GrupoStore');
        me.onStore('general.GradosStore');
        me.onStore('general.SedesStore');
        me.onStore('general.NivelesAcademicosStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewHonorRoll() + ' - ' + Global.getYear());
    },
    controller : 'academico',
    maxWidth   : 500,
    makHeight  : 600,
    items   : [{
        xtype       : 'customform',
        defaultType : 'fieldSet',
        items   : [
            {
                title   : 'Generar cuadro de Honor',
                layout	: 'vbox',
                defaults	: {
                    flex    : 1,
                    labelWidth: 50
                },
                items   : [
                    {
						xtype   : 'CbPeriodos',
						bind: {
							visible: 'true'
						}
                    },
					{
						xtype	: 'customcheckboxfield',
						boxLabel: 'Fin de año',
						name	: 'ckValue',
						itemId	: 'ckFin'
					},
                    {
                        xtype   : 'customButton',
                        text    : 'Generar cuadro de honor',
                        bind    : {
                            disabled : '{!periodo.value}'
                        },
                        handler : function (btn) {
							const me = Admin.getApplication(),
								win = btn.up('window'),
								param = {
									pdbPeriodo: win.down('#periodo').getValue(),
									pdbCk: win.down('#ckFin').getValue() ? 1 : 0
								};
							win.mask(AppLang.getSMsgLoading());
							const {school, profile}	= AuthToken.recoverParams();
							const dt			= new Date();
							param.schoolId  	= school.id || 0;
							param.profileId   	= profile.id || 0;
							param.year        	= school.year || dt.getFullYear();
                            Ext.Ajax.request({
                                url     : Global.getApiUrl() + '/academic/honor-frame',
                                params  : param,
                                timeout : 0,
								headers: {
									'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
								},
                                success: function(response, opts) {
                                    me.showResult('Se ha generado el cuadro de honor');
                                },
                                failure: function(response, opts) {
                                    me.showResult('server-side failure with status code ' + response.status);
                                },
                                callback    : function (e, r) {
                                   win.unmask();
                                }
                            });
                        }
                    }
                ]
            },
            {
                defaults	: {
                    flex    : 1,
                    labelWidth: 100
                },
                items       : [
                    {
                        xtype       : 'customnumberfield',
                        itemId      : 'limit',
                        maxValue	: 2000,
                        value       : 30,
                        fieldLabel  : 'Mostrar los primeros'
                    },
                    {
						xtype       : 'CbPeriodos',
						bind: {
							visible: 'true'
						},
                        width		: '100%',
                        reference   : 'per',
                        itemId      : 'per'
                    },
                    {
                        xtype       : 'CbSedes',
                        bind        : {
                            visible : '{per.value}'
                        }
                    },
                    {
                        xtype       : 'CbGrados',
                        bind        : {
                            visible : '{comboSedes.value}'
                        }
                    },
                    {
                        xtype       : 'CbGrupo',
                        bind        : {
                            visible : '{comboGrados.value}'
                        }
                    },
                    {
                        xtype       : 'customcheckboxfield',
                        boxLabel    : 'Cuadro de honor con foto',
                        itemId      : 'ckPhoto',
                        bind        : {
                            disabled    : '{!comboGrupo.value}'
                        },
                        listeners   : {
                            change : function (ck , newValue , oldValue) {
                                var
                                    me = ck.up('window');
                                if (newValue){
                                    me.down('#ckNivel').setValue(!newValue);
                                    me.down('#ckSede').setValue(!newValue);
                                    me.down('#ckGrado').setValue(!newValue);
                                }
                            }
                        }
                    },
                    {
                        xtype       : 'customcheckboxfield',
                        boxLabel    : 'Cuadro de honor todo el grado',
                        itemId      : 'ckGrado',
                        bind        : {
                            disabled    : '{!comboGrupo.value}'
                        },
                        listeners   : {
                            change : function (ck , newValue , oldValue) {
                                var
                                    me = ck.up('window');
                                if (newValue){
                                    me.down('#ckNivel').setValue(!newValue);
                                    me.down('#ckSede').setValue(!newValue);
                                    me.down('#ckPhoto').setValue(!newValue);
                                }
                            }
                        }
                    },
                    {
                        xtype       : 'customcheckboxfield',
                        boxLabel    : 'Cuadro de honor toda la sede',
                        itemId      : 'ckSede',
                        bind        : {
                            disabled    : '{!comboGrupo.value}'
                        },
                        listeners   : {
                            change : function (ck , newValue , oldValue) {
                                var
                                    me = ck.up('window');
                                if (newValue){
                                    me.down('#ckNivel').setValue(!newValue);
                                    me.down('#ckGrado').setValue(!newValue);
                                    me.down('#ckPhoto').setValue(!newValue);
                                }
                            }
                        }
                    },
                    {
                        xtype       : 'customcheckboxfield',
                        boxLabel    : 'Cuadro de honor por niveles',
                        itemId      : 'ckNivel',
                        reference 	: 'ckNivel',
                        bind        : {
                            disabled    : '{!comboGrupo.value}'
                        },
                        listeners   : {
                            change : function (ck , newValue , oldValue) {
                                var
                                    me = ck.up('window');
                                if (newValue){
                                    me.down('#ckSede').setValue(!newValue);
                                    me.down('#ckGrado').setValue(!newValue);
                                    me.down('#ckPhoto').setValue(!newValue);
                                }
                            }
                        }
                    },
                    {
                        xtype       : 'CbNivelAcademico',
                        bind        : {
                            visible : '{ckNivel.value}'
                        }
                    }
                ]
            }
        ],
        dockedItems: [{
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
                    xtype	: 'printButton',
                    bind        : {
                        disabled    : '{!comboGrupo.value}'
                    }
                },'-',
                {
                    xtype	: 'closebutton',
                    itemId	: 'btnUndo',
                    iconAlign	: 'left'
                }
            ]
        }]
    }]
});
