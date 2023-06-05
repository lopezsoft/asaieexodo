/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.view.docentes.ActividadesClaseView',{
    extend	: 'Admin.base.WindowCrud',
    requires: [
        'Admin.store.docentes.ActividadesClaseStore'
    ],
    title	: 'Actividades académicas',
    alias 	: 'widget.ActividadesClaseView',
    controller  : 'actividades',
    maximized   : true,
    items   : [
        {
            xtype       : 'customgrid',
            store		: 'ActividadesClaseStore',
            iconCls     : '',
            plugins		: [
                {
                    ptype		: 'rowexpander',
                    rowBodyTpl 	: new Ext.XTemplate(
                        '<p><b>Actividad:</b> {actividad}</p>',
                        '<p><b>Asignatura:</b> {asignatura}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            columns	: [
                {
                    xtype	: 'rownumberer'
                },
                {
                    text        : 'Actividades',
                    flex        : 2,
                    dataIndex   : 'actividad'
                },
                {
                    text 	: 'Curso',
                    columns : [
                        {
                            width 		: 105,
                            dataIndex	: 'grado'
                        },
                        {
                            width 		: 55,
                            dataIndex	: 'grupo',
                            filter		: 'list'
                        }
                    ]
                },
                {
                    text 		: 'Asignatura',
                    width 		: 250,
                    dataIndex	: 'asignatura',
                    filter		: 'list'
                },
                {
                    text 		: 'Fecha',
                    width 		: 95,
                    dataIndex	: 'fecha'
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype   : 'toolbarCrud'
                }
            ],
            listeners :{
                resize: function (grid, width, height, oldWidth, oldHeight, eOpts ){
                    if (width <=700) {
                        grid.getColumns()[6].setHidden(true);
                    }else {
                        grid.getColumns()[6].setHidden(false);
                    }
                }
            }
        }
    ]
});
