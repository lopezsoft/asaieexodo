Ext.define('Admin.view.promocion.AntiguosView',{
    extend      : 'Admin.forms.CustomForm',
    controller  : 'Promocion',
    requires    : [
        'Admin.store.promocion.ListaMatriculaStore',
        'Admin.store.general.MatricularAntiguosStore'
    ],
    initComponent   : function(){
        let me  = this,
            app = Admin.getApplication();
        app.onStore('promocion.ListaMatriculaStore');
        app.onStore('general.SedesStore');
        app.onStore('general.GradosStore');
        app.onStore('general.GrupoStore');
        app.onStore('general.JornadasStore');
        app.onStore('general.MatricularAntiguosStore');

        me.callParent();
        me.setTitle('Matricular estudiantes antiguos - ' + Global.getYear());
    },
    alias           : 'widget.enrollmentold',
    showSaveButton  : false,
    layout: {
        type    : 'hbox',
        align   : 'stretch'
	},
	scrollable			: true,
    items   : [
        {
            xtype   		: 'panel',
			ui      		: 'panel-white',
			scrollable		: true,
            flex    : 3,
            margin  : 2,
            items   : [
                {
                    xtype   : 'fieldset',
                    title   : 'Búsqueda de estudiantes antiguos a matricular',
                    defaults : {
                        labelWidth	: 60
                    },
                    flex    : 2,
                    items   : [
                        {
                            xtype       : 'CbSedes'
                        },
                        {
                            xtype   : 'CbJornadas',
                            bind    : {
                                visible : '{comboSedes.value}'
                            }
                        },
                        {
                            xtype   : 'CbGrados',
                            bind    : {
                                visible : '{comboJornadas.value}'
                            },
                            listeners   : {
                                select : function(cb, record , eOpts ){
									const win = cb.up('form'),
										gdo = record.get('id'),
										gb = Global;
									if (gdo === 22 || gdo === 23){
                                        win.down('#yr').setValue(gb.getYear());
                                    }else {
                                        win.down('#yr').setValue(gb.getYear() - 1);
                                    }
                                }
                            }
                        },
                        {
                            xtype   : 'CbGrupo',
                            bind    : {
                                visible : '{comboGrados.value}'
                            }
                        },
                        {
                            xtype       : 'customnumberfield',
                            itemId      : 'yr',
                            fieldLabel  : 'Año',
                            disabled    : true,
                            value       : Global.getYear() - 1
                        },
                        {
                            xtype       : 'customButton',
                            iconCls     : 'x-fa fa-search',
                            text        : 'Buscar',
                            bind    : {
                                visible : '{comboJornadas.value}'
                            },
                            handler     : function (btn) {
								const win = btn.up('form'),
									me = Admin.getApplication(),
									gdo = win.down('#comboGrados').selection.get('id');
								let extra = {
									pdbGrado: win.down('#comboGrados').selection.get('id'),
									pdbGrupo: win.down('#comboGrupo').selection.get('grupo'),
									pdbSede: win.down('#comboSedes').selection.get('id'),
									pdbJorn: win.down('#comboJornadas').selection.get('cod_jorn'),
									pdbYear: Global.getYear() - 1,
									pdbTable: 'student_enrollment',
									promoted:  0
								};
								if (gdo === 22 || gdo === 23) {
									extra.pdbYear = Global.getYear();
								}
                                me.setParamStore('ListaMatriculaStore',extra,true);
                            }
                        }
                    ]
                },
                {
                    xtype   : 'fieldset',
                    itemId  : 'Mat',
                    title   : 'Matricular estudiantes',
                    hidden  : true,
                    defaults : {
                        labelWidth	: 60
                    },
                    flex    : 2,
                    items   : [
                        {
                            xtype       : 'CbSedes',
                            reference   : 'cbSedes',
                            itemId      : 'cbSedes'
                        },
                        {
                            xtype       : 'CbGrupo',
                            reference   : 'cbGrupos',
                            bind        : {
                                visible : '{cbSedes.value}'
                            },
                            itemId      : 'cbGrupos'
                        },
                        {
                            xtype       : 'CbJornadas',
                            reference   : 'cbJornadas',
                            bind    : {
                                visible : '{cbGrupos.value}'
                            },
                            itemId      : 'cbJornadas'
                        },
                        {
                            xtype       : 'yearField',
                            fieldLabel  : 'Año',
                            disabled    : true,
                            value       : Global.getYear()
                        },
                        {
                            xtype       : 'customButton',
                            iconCls     : 'x-fa fa-check',
                            text        : 'Matricular',
                            bind    : {
                                visible : '{cbJornadas.value}'
                            },
                            handler     : 'onMatricularAntiguos'
                        }
                    ]
                }
            ]
        },
        {
            xtype   : 'customgrid',
            store   : 'ListaMatriculaStore',
            margin  : '0 0 0 0',
            flex    : 4,
            // title   : 'CONSULTA',
            autoLoad : false,
            syncHeight : false,
            plugins: [					
                {
                    ptype: 'rowexpander',
                    rowBodyTpl: new Ext.XTemplate(												
                        '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                    )
                }
            ],
            listeners : {
                'selectionchange': function(grid, selected, eOpts) {
					const me = this;
					if (me.up('form').down('#Mat')) {
                        me.up('form').down('#Mat').setHidden(!selected.length);
                    }
                }
            },
            columns: [
                {
                    xtype: 'rownumberer'
                },
                {
                    text        : 'Apellidos y Nombres',
                    dataIndex   : 'nombres',
                    width       : 290
                },
                {
                    text        : 'Grado',
                    dataIndex   : 'grado',
                    width       : 120
                },
                {
                    text        : 'Grupo',
                    dataIndex   : 'id_group',
                    width       : 60
                },
                {
                    text        : 'Jornada',
                    dataIndex   : 'jornada',
                    width       : 120
                },
				{
					text: 'Año',
					dataIndex: 'year',
					width: 65
				},
                {
                    text        : 'Sede',
                    dataIndex   : 'sede',
                    width       : 190
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbarCrud',
                    items: [
                        '->',
                        '-',
                        {
                            xtype: 'closebutton'
                        }
                    ]
                },
                {
                    xtype: 'pagination'
                }
            ]
        }
    ]
});
