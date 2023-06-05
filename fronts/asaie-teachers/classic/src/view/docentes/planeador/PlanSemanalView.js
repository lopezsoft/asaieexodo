/**
 * Created by LOPEZSOFT on 14/12/2015.
 */
Ext.define('Admin.view.docentes.PlanSemanalView' ,{
    extend: 'Admin.grid.CustomGrid',
    alias : 'widget.PlanSemanalView',
    store : 'PlanSemanalStore',
    title : 'Plan semanal de clases',
    requires: [
        'Admin.view.docentes.controller.ParceladorController',
        'Admin.store.docentes.PlanSemanalStore',
        'Admin.view.docentes.PlanSemanalNewView'
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
                    xtype   : 'addButton',
                    handler : 'onAddPlan'
                },'-',
                {
                    xtype   : 'editButton',
                    handler : 'onAddPlan'
                },'-',
                {
                    xtype   : 'deletebutton'
                },
                '-','->',
                {
                    xtype	: 'printButton'
                }
            ]
        },
        {
            xtype 			: 'pagination',
            store			: 'PlanSemanalStore'
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