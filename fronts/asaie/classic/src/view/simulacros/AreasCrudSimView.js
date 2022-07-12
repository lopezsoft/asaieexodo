/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.view.simulacros.AreasCrudSimView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.AreasCrudSimView',
    title   : 'Ficha Áreas',
    requires: [
        'Admin.store.simulacros.AreasSimStore'
    ],
    controller : 'Simulacros',
    width   : 800,
    height  : 600,
    maximized   : true,
    items   : [{
        xtype       : 'customgrid',
        iconCls     : '',
        store       : 'AreasSimStore',
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Nombre del área',
                dataIndex   : 'nombre',
                width       : 300,
                filter      : 'string'
            },
            {
                text        : 'Abreviatura',
                dataIndex   : 'abrev',
                width       : 100,
                filter      : 'list'
            },
            {
                text        : 'Año',
                dataIndex   : 'año',
                width       : 65
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Estado (Activa)',
                dataIndex   : 'estado',
                width       : 120,
                disabled    : true
            }
        ],
        dockedItems : [
            {
                xtype   : 'toolbarCrud',
                items   : [
                    {
                        xtype   : 'addButton',
                        handler : 'onCreateAreasView'
                    },'-',
                    {
                        xtype   : 'editButton',
                        handler : 'onCreateAreasView'
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