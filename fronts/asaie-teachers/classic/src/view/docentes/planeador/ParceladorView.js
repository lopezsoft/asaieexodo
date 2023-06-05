/**
 * Created by LEWIS on 26/11/2015.
 */
Ext.define('Admin.view.docentes.ParceladorView' ,{
        extend: 'Admin.grid.CustomGrid',
        alias : 'widget.ParceladorView',
        store : 'ParceladorStore',
        title : 'Plan de formación (parcelador)',
        requires: [
            'Admin.view.docentes.controller.ParceladorController',
            'Admin.view.docentes.ParceladorCliView',
            'Admin.view.docentes.ParceladorUnidadesView',
            'Admin.view.docentes.ParceladorConTemView'
        ],

        controller: 'parcelador',
        plugins		: [
            {
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate(
                    '<p><b>Grado:</b> {grado}</p>',
                    '<p><b>Asignatura:</b> {asignatura}</p>',
                    '<p><b>Periodo:</b> {periodo}</p>'
                )
            },
            {
                ptype : 'gridfilters'
            },
            {
                ptype : 'responsive'
            }
        ],
        columns: [
        {
            xtype	: 'rownumberer'
        },
        {
            text    	: "Grado",
            flex		: 1,
            sortable	: true,
            dataIndex	: 'grado',
            filter		: 'string'
        },
        {
            text		: "Asignatura",
            flex		: 1,
            sortable	: true,
            dataIndex	: 'asignatura',
            filter		: 'list'
        },
        {
            text		: "Periodo",
            width		: 75,
            sortable	: true,
            dataIndex	: 'periodo',
            filter		: 'list'
        },
        {
            text		: "Año",
            width		: 55,
            dataIndex	: 'año'
        }
    ],

    dockedItems: [
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
                },'-','->',
                {
                    xtype   : 'customButton',
                    iconCls : 'x-fa fa-bars',
                    itemId  : 'btnListPar',
                    disabled: true,
                    menu    : [
                        {
                            text    : 'Descriptores',
                            iconCls : 'x-fa fa-circle',
                            handler	: 'onCli'
                        },'-',
                        {
                            text    : 'Unidades / Ejes temáticos',
                            iconCls : 'x-fa fa-circle',
                            itemId  : 'btnUnidades'
                        },
                        {
                            text    : 'Contenido temático',
                            iconCls : 'x-fa fa-circle',
                            itemId  : 'btnContenido'
                        }
                    ]
                },'-',
                {
                    xtype	: 'printButton'
                }
            ]
        },
        {
            xtype 			: 'pagination'
        }
    ],

    listeners: {
        resize: function (grid, width, height, oldWidth, oldHeight, eOpts ){
            if (width <400) {
                grid.getColumns()[3].setHidden(true);
                grid.getColumns()[4].setHidden(true);
            }else {
                grid.getColumns()[3].setHidden(false);
                grid.getColumns()[4].setHidden(false);
            }
        }
    }
});
