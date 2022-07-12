Ext.define('Admin.view.configuraciones.ModelosObservadorView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.modelosobservadorview',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Modelos de observador - '+ Global.getYear());
    },
    items       : [
        {
            xtype       : 'customgrid',
            store       : 'ModelosObservadorStore',
            columns     : [
                {
                    xtype   : 'customrownumberer'
                },
                {
                    dataIndex   : 'descripcion',
                    text        : 'Descripción',
                    flex        : 2
                },
                {
                    xtype       : 'checkcolumn',
                    disabled    : true,
                    dataIndex   : 'estado',
                    text        : 'Activo',
                    width       : 70
                }
            ],
            listeners : {
                'selectionchange': function(grid, selected, eOpts) {
                    var me = this;
                    if (me.down('#btnEnca')) {
                        me.down('#btnEnca').setDisabled(!selected.length);
                    }
                    if (me.down('#btnAspec')) {
                        me.down('#btnAspec').setDisabled(!selected.length);
                    }
                }
            },
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype       : 'customToolbar',
                    items   : [
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-eye',
                            text    : 'Encabezado',
                            itemId  : 'btnEnca',
                            disabled: true,
                            handler : 'onEncabezadoObservador'
                        },'-',
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-eye',
                            text    : 'Aspectos',
                            itemId  : 'btnAspec',
                            disabled: true,
                            handler : 'onAspectosObservador'
                        }
                    ]
                }
            ]
        }
    ]
});