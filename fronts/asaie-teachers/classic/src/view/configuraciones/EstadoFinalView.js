Ext.define('Admin.view.configuraciones.EstadoFinalView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.estadofinalestudiante',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Estado final del estudiante - '+ Global.getYear());
    },
    store   : 'EstadoFinalStore',
    saveData : function (storeName,reload) {
        var
            store   = Ext.getStore(storeName),
            me      = Admin.getApplication();
        if (store.getModifiedRecords().length > 0) {
            store.sync();
        }else {
            me.showResult('No hay cambios')
        }
    },
    items: [
        {
            xtype       : 'customgrid',
            store       : 'EstadoFinalStore',
            features: [{
                ftype           : 'grouping',
                startCollapsed  : true,
                groupHeaderTpl  : 'Grupo de grados: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
            }],
            plugins: [
                {
                    ptype           : 'gridfilters'
                },
                {
                    ptype			: 'cellediting',
                    clicksToEdit	: 1,
                    default         : 'textfield',
                    triggerEvent    : 'cellclick'
                }
            ],
            columns : [
                {
                    xtype   : 'customrownumberer'
                },
                {
                    dataIndex   : 'descripcion_estado',
                    text        : 'Descripción del estado',
                    flex        : 2,
                    editor      : {
                        allowBlank		: false,
                        selectOnFocus 	: true
                    }
                },
                {
                    xtype       : 'checkcolumn',
                    dataIndex   : 'prom_manual',
                    text        : 'Prom manual',
                    width       : 120
                }
            ],
            dockedItems: [
                {
                    xtype       : 'pagination'
                },
                {
                    xtype		: 'toolbarSave',
                    frmBind     : false
                }
            ]
        }
    ]
});