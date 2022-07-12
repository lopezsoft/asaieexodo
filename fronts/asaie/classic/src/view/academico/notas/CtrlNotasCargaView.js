/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
function setCkBox(win,ck) {
    var
        x   = 0,
        ckn = '',
        cn  = ck.itemId;
    for (x = 1; x < 18; x++) {
        ckn = 'ck'+x.toString();
        if(ckn == cn){
            win.typeReport = x;
        }else {
            win.down('#'+ckn).setValue(false);
        }
    }
};

Ext.define('Admin.view.academico.CtrlNotasCargaView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'ReportesAcademico',
    typeReport  : 0,
    requires    : [
        'Admin.container.SedesJorn',
        'Admin.combo.CbGrupo',
        'Admin.combo.CbPeriodos',
        'Admin.container.ContainerListData',
        'Admin.store.admin.DocentesDirGrupoStore'
    ],
    initComponent: function (param) {  
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleLists() + ' - ' + Global.getYear());
    },
    alias       : 'widget.CtrlNotasCargaView',
    itemId      : 'CtrlNotasCargaView',
    items       : [
        {
            xtype   : 'customform',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items   : [
                {
                    xtype   : 'customform',
                    flex    : 4,
                    items   : [
                        {
                            xtype	: 'customgrid',
                            title	: 'LISTA DOCENTES',
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
                                    mode            : 'local',
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
							listeners	: {
								'selectionchange' : function (grid,selected) {
									extra = {
										pdbTable: 'periodos_academicos',
										pdbGrado: 5,
										pdbType	: 0
									};
									Admin.getApplication().setParamStore('PeriodosStore', extra);
								}
							},
                            dockedItems : [
                                {
                                    xtype   : 'customToolbar',
                                    items   :[
                                        {
                                            xtype   : 'ContainerListData'
                                        },'->',
                                        {
                                            xtype   : 'closebutton'
                                        }
                                    ]
                                },
                                {
                                    xtype 		: 'pagination',
                                    itemId      : 'pToolbar',
                                    showPrint   : false,
                                    showExport   : false,
                                    displayInfo : false
                                }
                            ]
                        }
                    ],
                    dockedItems : [
                    ]
                },
                {
                    xtype   : 'customform',
                    itemId  : 'frmReport',
                    margin  : '0 1 0 0',
                    title   : 'Modelos de plantillas de notas y asistencias',
                    flex    : 3,
                    defaultType : 'fieldSet',
                    items   : [
                        {
                            title   : 'Vertical',
                            defaultType : 'customcheckboxfield',
                            width   : '100%',
                            height  : 300,
                            items   : [
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias sin dimensiones (Oficio)',
                                    inputValue  : '1',
                                    itemId      : 'ck1',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias con dimensiones y A.E (Oficio)',
                                    inputValue  : '2',
                                    itemId          : 'ck2',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias con dimensiones (Carta)',
                                    inputValue  : '3',
                                    itemId      : 'ck3',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias con dimensiones (Oficio)',
                                    inputValue  : '4',
                                    itemId          : 'ck4',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Asistencias (Oficio)',
                                    inputValue  : '5',
                                    itemId          : 'ck5',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Asistencias (Carta)',
                                    inputValue  : '6',
                                    itemId          : 'ck6',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias por competencias (Carta)',
                                    inputValue  : '7',
                                    itemId          : 'ck7',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias  por competencias (Oficio)',
                                    inputValue  : '8',
                                    itemId          : 'ck8',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias por competencias (Carta)',
                                    inputValue  : '9',
                                    itemId          : 'ck9',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas e Inasistencias  por competencias (Oficio)',
                                    inputValue  : '10',
                                    itemId          : 'ck10',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            title   : 'Horizontal',
                            defaultType : 'customcheckboxfield',
                            width   : '100%',
                            height  : 300,
                            items   : [
                                {
                                    boxLabel    : 'Ctrl. Notas y asistencias con dimensiones y A.E (Carta)',
                                    inputValue  : '11',
                                    itemId          : 'ck11',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas y asistencias con A.E y dimensiones (Carta)',
                                    inputValue  : '12',
                                    itemId      : 'ck12',
                                    name        : 'trep',
                                    disabled    : true,
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas por logros y dimensiones (Oficio)',
                                    inputValue  : '13',
                                    itemId      : 'ck13',
                                    name        : 'trep',
                                    disabled    : true,
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas y asistencias con dimensiones y A.E (Oficio)',
                                    inputValue  : '14',
                                    itemId      : 'ck14',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Notas  por competencias (Oficio)',
                                    inputValue  : '15',
                                    itemId         : 'ck15',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Ctrl. Asistencias (Oficio)',
                                    inputValue  : '16',
                                    itemId      : 'ck16',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                },
                                {
                                    boxLabel    : 'Planilla de calificaciones (carta)',
                                    inputValue  : '17',
                                    itemId      : 'ck17',
                                    name        : 'trep',
                                    listeners   : {
                                        change : function (ck , newValue , oldValue , eOpts) {
                                            var
                                                win = ck.up('window');
                                            if (newValue){
                                                setCkBox(win,ck);
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    dockedItems : [
                        {
                            xtype   : 'customToolbar',
                            dock	: 'bottom',
                            items   : [
                                {
                                    xtype: 'CbPeriodos',
                                    labelAlign : 'left'
                                },
                                {
                                    xtype   : 'printButton',
                                    bind    : {
                                        disabled : '{!periodo.value}'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            dockedItems : [
            ]
        }
    ]
});
