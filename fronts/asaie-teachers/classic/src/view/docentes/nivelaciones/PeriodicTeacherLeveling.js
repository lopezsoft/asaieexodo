Ext.define('Admin.view.docentes.PeriodicTeacherLeveling',{
    extend      : 'Admin.forms.CustomForm',
    alias	    : 'widget.periodicteacherleveling',
    controller  : 'recuperaciones',
    initComponent : function(){
        this.setTitle('Nivelaciones periódicas');
        this.callParent(arguments);
    },
    showSaveButton  : false,
    items : [
        {
            xtype       : 'customgrid',
            selModel    : 'rowmodel',
            store	    : 'CargaAgrupadaStore',
            plugins		: [
                {
                    ptype		: 'rowexpander',
                    rowBodyTpl 	: new Ext.XTemplate(
                        '<p><b>Grado:</b> {grado}</p>',
                        '<p><b>Asignatura:</b> {asignatura}</p>',
                        '<p><b>Sede:</b> {sede}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            columns: [
                {
                    xtype	: 'rownumberer'
                },
                {
                    text    	: "Grado",
                    width       : 100,
                    sortable	: true,
                    dataIndex	: 'grado'
                },
                {
                    text		: "Asignatura",
                    flex		: 2,
                    sortable	: true,
                    dataIndex	: 'asignatura'
                },
                {
                    text		: "Sede",
                    flex		: 2,
                    sortable	: true,
                    dataIndex	: 'sede'
                },
                {
                    text		: "Año",
                    width		: 60,
                    dataIndex	: 'year'
                }
            ],
            listeners : {
                'selectionchange': function(grid, selected, eOpts) {
                    this.down('#btnNivel').setDisabled(!selected.length);
                }
            },
            tbar : [
                {
                    xtype		: 'customButton',
                    text 		: 'Cargar nivelaciones',
                    itemId		: 'btnNivel',
                    handler     : 'onClickCargar',
                    disabled	: true,
                    iconCls 	: 'x-fa fa-spinner'
                },'->',
                {
                    xtype       : 'closebutton'
                }
            ]
        }
    ]
});
