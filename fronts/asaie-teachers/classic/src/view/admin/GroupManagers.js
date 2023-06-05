Ext.define('Admin.view.admin.GroupManagers',{
    extend  : 'Admin.forms.CustomForm',
    alias   : 'widget.groupmanagers',
    requires: [
        'Admin.store.general.GradosStore',
        'Admin.store.admin.DirGrupoStore'
    ],
    controller      : 'admin',
    showSaveButton  : false,
    initComponent   : function () {
        let me  = Admin.getApplication();
        me.onStore('general.GradosStore');
        me.onStore('general.GradesAllStore');
        me.onStore('general.GrupoStore');
        me.onStore('general.SedesStore');
        me.onStore('general.JornadasStore');
        me.onStore('admin.DirGrupoStore');
        me.onStore('admin.DocentesDirGrupoStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewGroupDirectors());
    },
    modalView   : 'Admin.view.admin.forms.SaveGroupManagers',
    items : [
        {
            xtype   : 'customgrid',
            // title   : 'DIRECTORES DE GRUPO',
            store   : 'DirGrupoStore',
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
            columns: [
                {
                    xtype: 'customrownumberer'
                },
                {
                    xtype       : 'checkcolumn',
                    text        : 'Activo',
                    dataIndex   : 'estado',
                    width       : 65,
                    headerCheckbox: true,
                    stopSelection: false
                },
                {
                    text        : 'Grado',
                    dataIndex   : 'grado',
                    width       : 150
                },
                {
                    text: 'Grupo',
                    dataIndex: 'grupo',
                    width: 65,
                    filter: 'list'
                },
                {
                    text: 'Año',
                    dataIndex: 'year',
                    width: 55
                },
                {
                    text: 'Docente',
                    dataIndex: 'docente',
                    width: 300,
                    filter: 'string'
                },
                {
                    text: 'Sede',
                    dataIndex: 'sede',
                    width: 300,
                    filter: 'string'
                },
                {
                    text: 'Jornada',
                    dataIndex: 'jornada',
                    width: 180,
                    filter: 'list'
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbarCrud',
                    items: [
                        {
                            xtype     : 'saveButton',
                            handler   : function (btn) {
                                var
                                    store   = Ext.getStore('DirGrupoStore'),
                                    me      = Admin.getApplication();
                                store.sync({
                                    success : function(batch, o){
                                        me.showResult('Se han guardado los datos');
                                    }
                                });
                            }
                        },
                        {
                            xtype   : 'addButton',
                            tooltip : AppLang.getSTitleViewAddGroupDirectors()
                        }, '-',
                        {
                            xtype: 'deletebutton'
                        }, '-',
                        {
                            xtype: 'closebutton'
                        },'->',
                        {
                            xtype       : 'printButton',
                            disabled 	: false,
                            alias	    : 'widget.btnPrinter1',
                            itemId		: 'printButton'
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
