/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.view.docentes.ParceladorCliView', {
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.ParceladorCliView',
    title   : 'Pacelador - CLI',
    width   : 650,
    height  : 500,
    requires: [
        'Admin.store.docentes.ParceladorCliStore',
        'Admin.view.docentes.ParceladorCliNewView',
        'Admin.view.docentes.ParceladorUnidadesView',
        'Admin.view.docentes.BancoCliView'
    ],
    controller :  'parcelador',
    maximized  : true,
    items   : [
        {
            xtype   : 'customgrid',
            iconCls : '',
            store   : 'ParceladorCliStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>',
                        '<p><b>Estrategias de aprendizaje:</b> {estra_apren}</p>',
                        '<p><b>Competencia:</b> {competencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype : 'responsive'
                }
            ],
			features: [
				{
					ftype	: 'grouping',
					startCollapsed: true,
					groupHeaderTpl: '<span style="color:#7e55ef;"> <b>' + '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})' + '</b></span>'
				}
			],
            columns :  [
                {
                    xtype       : 'rownumberer'
                },
                {
                    text        : 'Descripción',
                    dataIndex   : 'descripcion',
                    flex        : 2
                },
                {
                    text        : 'Estrategias de aprendizaje',
                    dataIndex   : 'estra_apren',
                    flex        : 2
                },
                {
                    text        : 'Competencia',
                    dataIndex   : 'competencia',
                    width       : 250
                }
            ],
            dockedItems: [
                {
                    xtype   : 'toolbarCrud'
                },
                {
                    xtype   : 'customButton',
                    iconCls : 'x-fa fa-upload',
                    itemId  : 'btnImport',
                    text    : 'Importar...',
                    handler : 'onImportCli'
                },
                {
                    xtype   : 'pagination',
                    store   : 'ParceladorCliStore'
                }
            ]
        }
    ],
    listeners: {
        resize: function (win, width){
            grid = win.down('grid');
            if (width <400) {
                grid.getColumns()[3].setHidden(true);
            }else {
                grid.getColumns()[3].setHidden(false);
            }
        }
    }
});
