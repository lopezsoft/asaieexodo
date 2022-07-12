/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.view.configuraciones.ProyCupos',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.ProyCupos',
    title   : 'Ficha Proyección de cupos',
    requires: [
        'Admin.store.general.ProyCuposStore',
        'Admin.combo.CbSedes',
        'Admin.combo.CbGrados'
    ],
    controller  : 'configuraciones',
    width   : 800,
    height  : 600,
    maximized   : true,
    items   : [{
        xtype       : 'customgrid',
        iconCls     : '',
        store       : 'ProyCuposStore',
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Cupos',
                dataIndex   : 'total',
                width       : 65
            },
            {
                text        : 'Grado',
                dataIndex   : 'grado',
                width       : 340
            },
            {
                text        : 'Sede',
                dataIndex   : 'sede',
                width       : 300
            },
            {
                text        : 'Año',
                dataIndex   : 'año',
                width       : 65
            },
            {
                text        : 'Tipo',
                dataIndex   : 'tipo_proy',
                width       : 100
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Estado (Activo)',
                dataIndex   : 'estado',
                width       : 120
            }
        ],
        dockedItems : [
            {
                xtype   : 'toolbarCrud',
                items   : [
                    {
                        xtype   : 'addButton',
                        handler : 'onNewProyCupos'
                    },'-',
                    {
                        xtype   : 'editButton',
                        handler : 'onNewProyCupos'
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
                        xtype   : 'ContainerListData'
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