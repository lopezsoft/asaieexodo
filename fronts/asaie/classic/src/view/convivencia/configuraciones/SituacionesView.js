/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.configuraciones.SituacionesView',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.SituacionesView',
    maximized   : true,
    requires    : [
        'Admin.store.convivencia.SituacionesStore',
        'Admin.view.convivencia.configuraciones.SituacionesViewCrud'
    ],
    items : [
        {
            xtype   : 'customgrid',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: false,
                    independent		: true
                }
            ],
            iconCls : '',
            store   : 'SituacionesStore',
            columns : [
                {
                    xtype	    : 'rownumberer'
                },
                {
                    dataIndex   : 'numero',
                    text        : 'Número',
                    width       : 80
                },
                {
                    dataIndex   : 'descripcion',
                    text        : 'Descripción',
                    flex        : 2,
                    sortable    : true
                },
                {
                    dataIndex   : 'tipo',
                    text        : 'Tipo',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'año',
                    text        : 'Año',
                    width       :  60
                }
            ],
            dockedItems: [
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar'
                },
                {
                    xtype       : 'toolbarCrud'
                }
            ]
        }
    ]
});