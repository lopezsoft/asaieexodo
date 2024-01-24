Ext.define('Admin.view.academico.AsignaturasForm',{
    extend  : 'Admin.forms.CustomForm',
    alias   : 'widget.asignaturas',
    xtype   : 'asignaturas',
    controller: 'academico',
    initComponent: function () {
		const me = Admin.getApplication();
		me.onStore('general.AreasStore');
		me.onStore('general.AsignaturaCertificadoStore');
		me.onStore('general.AsignaturaStore');
		me.onStore('general.AreasAsignaturaStore');
		me.onStore('general.AsignaturasTypeStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewSubjects());
    },
    modalView       : 'Admin.view.academico.AsignaturasView',
    showSaveButton  : false,
    store   : 'AsignaturaStore',
    items   : [{
        xtype       : 'customgrid',
        syncHeight  : true,
        selModel    : 'rowmodel',
        store       : 'AsignaturaStore',
        plugins		: [
            {
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate(
                    '<p><b>Nombre:</b> {asignatura}</p>'
                )
            },
            {
                ptype			: 'gridSearch',
                readonlyIndexes	: ['note'],
                disableIndexes	: ['pctChange'],
                minChars		: 1,
                mode            : 'local',
                flex			: 1,
                autoFocus		: false,
                independent		: true
            }
        ],
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Orden',
                dataIndex   : 'ordenar',
                width       : 80
            },
            {
                text        : 'Nombre de la asignatura',
                dataIndex   : 'asignatura',
                flex       	: 2,
                filter      : 'string'
            },
            {
                text        : 'Abreviatura',
                dataIndex   : 'abrev',
                width       : 100,
                filter      : 'list'
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Excluida PROM',
                dataIndex   : 'excluir',
                width       : 120,
                disabled    : true
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Electiva',
                dataIndex   : 'excluir',
                width       : 120,
                disabled    : true
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Activa',
                dataIndex   : 'estado',
                width       : 60,
                disabled    : true
            },
			{
				text        : 'Tipo',
				dataIndex   : 'type',
				width       : 60,
				disabled    : true
			},
        ],
        listeners   : {
            'selectionchange': function(grid, selected) {
				const me = this;
				if (me.down('#btnDistrib')){
                    me.down('#btnDistrib').setDisabled(!selected.length);
                }
                if (me.down('#btnAreas')){
                    me.down('#btnAreas').setDisabled(!selected.length);
                }
            }
        },
        dockedItems : [
            {
                xtype   : 'toolbarCrud',
                items   : [
                    {
                        xtype   : 'addButton'
                    },'-',
                    {
                        xtype   : 'editButton'
                    },'-',
                    {
                        xtype   : 'deletebutton'
                    },'-',
                    {
                        xtype   : 'closebutton'
                    }
                ]
            },
            {
                xtype   : 'customToolbar',
                items   :[
                    {
                        iconCls	: 'x-fa fa-plus',
                        xtype   : 'customButton',
                        itemId  : 'btnDistrib',
                        text    : 'Distribución en certificados',
                        disabled: true,
                        handler : 'onCreateAsignaturasCert'
                    },
                    {
                        iconCls : 'x-fa fa-plus',
                        xtype   : 'customButton',
                        itemId  : 'btnAreas',
                        text    : 'Áreas',
                        disabled: true,
                        handler: 'onCreateArAsig'
                    }
                ]
            },
            {
                xtype 		: 'pagination',
                itemId		: 'pToolbar'
            }
        ]
    }]
});
