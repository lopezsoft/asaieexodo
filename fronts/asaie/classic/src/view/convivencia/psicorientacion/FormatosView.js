/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.psicorientacion.FormatosView',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.FormatosView',
    maximized   : true,
    controler   : 'convivencia',
    requires    : [
        'Admin.store.convivencia.FormatosStore',
        'Admin.store.convivencia.AccionesStore',
        'Ext.layout.component.field.HtmlEditor',
        'Ext.layout.container.VBox',
        'Ext.layout.container.boxOverflow.Menu',
        'Ext.picker.Color',
        'Ext.tip.QuickTipManager',
        'Ext.toolbar.Item',
        'Ext.toolbar.Toolbar',
        'Ext.util.Format',
        'Ext.util.TaskManager'
    ],
    items : [
        {
            xtype   : 'customgrid',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Cuerpo:</b> {cuerpo}</p>',
                        '<p><b>Comprensiòn Lectora:</b> {comprension_lectora}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype : 'responsive'
                }
            ],
            iconCls : '',
            store   : 'FormatosStore',
            columns : [
                {
                    xtype	    : 'rownumberer'
                },
                {
                    dataIndex   : 'accion',
                    text        : 'Acción',
                    flex        : 1,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'titulo',
                    text        : 'Titulo',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'string'
                }
            ],
            dockedItems: [
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar'
                },
                {
                    xtype       : 'toolbarCrud',
                    items 	: [
                        {
                            xtype	: 'addButton',
                            handler : 'onNewFormato'
                        },'-',
                        {
                            xtype	: 'editButton',
                            handler : 'onNewFormato'
                        },'-',
                        {
                            xtype	: 'deletebutton'
                        },'-',
                        {
                            xtype 	: 'closebutton'
                        },'-','->',
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        }
                    ]
                }
            ]
        }
    ]
});