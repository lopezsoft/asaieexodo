/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.view.docentes.ParceladorUnidadesView', {
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.ParceladorUnidadesView',
    title   : 'Pacelador - Unidades / Ejes temáticos',
    width   : 650,
    height  : 500,
    requires: [
        'Admin.store.docentes.ParceladorUnidadesStore',
        'Admin.view.docentes.ParceladorUnidadesNewView'
    ],
    controller :  'parcelador',
    maximized  : true,
    items   : [
        {
            xtype   : 'customgrid',
            iconCls : '',
            store   : 'ParceladorUnidadesStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Unidades / Ejes temáticos:</b> {ejes_tematicos}</p>',
                        '<p><b>Temas / Contenidos:</b> {temas_contenidos}</p>'
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
                    text        : 'Unidades / Ejes temáticos',
                    dataIndex   : 'ejes_tematicos',
                    flex        : 2
                },
                {
                    text        : 'Temas / Contenidos',
                    dataIndex   : 'temas_contenidos',
                    flex        : 2
                }
            ],
            dockedItems: [
                {
                    xtype   : 'toolbarCrud'
                },
                {
                    xtype   : 'pagination',
                    store   : 'ParceladorUnidadesStore'
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