/**
 * Created by LOPEZSOFT on 10/12/2015.
 */

Ext.define('Admin.view.docentes.ParceladorConTemView', {
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.ParceladorConTemView',
    title   : 'Contenido temático',
    width   : 650,
    height  : 500,
    requires : [
        'Admin.store.docentes.ParceladorConTemStore',
        'Admin.store.docentes.ParceladorItemsConTemStore',
        'Admin.view.docentes.ParceladorConTemNewView'
    ],
    controller :  'parcelador',
    maximized  : true,
    items   : [
        {
            xtype   : 'customgrid',
            iconCls : '',
            store   : 'ParceladorConTemStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>',
                        '<p><b>Tipo:</b> {descripcion_item}</p>'

                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype : 'responsive'
                }
            ],
            columns :  [
                {
                    xtype       : 'rownumberer'
                },
                {
                    text        : 'ID',
                    dataIndex   : 'id',
                    width       : 40
                },
                {
                    text        : 'Descripción',
                    dataIndex   : 'descripcion',
                    flex        : 2
                },
                {
                    text        : 'Tipo',
                    dataIndex   : 'descripcion_item',
                    flex        : 2
                }
            ],
            dockedItems: [
                {
                    xtype   : 'toolbarCrud'
                },
                {
                    xtype   : 'pagination',
                    store   : 'ParceladorConTemStore'
                }
            ]
        }
    ],
    resize: function (win, width, height, oldWidth, oldHeight, eOpts ){
        grid = win.down('grid');
        if (width <=400) {
            grid.getColumns()[4].setHidden(true);
        }else {
            grid.getColumns()[4].setHidden(false);
        }
    }
});