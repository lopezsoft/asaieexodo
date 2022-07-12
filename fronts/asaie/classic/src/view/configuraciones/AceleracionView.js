/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
var
    defaultEditor   = {
        allowBlank		: false,
        selectOnFocus 	: true,
        emptyText		: '00.00',
        maskRe			: /[\d\.]/
    };

Ext.define('Admin.view.configuraciones.AceleracionView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Escala de competencias/Dimensiones aceleración',
    controller  : 'configuraciones',
    alias       : 'widget.AceleracionView',
    height	    : 450,
    width       : 660,
    items       : [
        {
            xtype   : 'customform',
            layout	: 'fit',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'AceleracionStore',
                    iconCls     : '',
                    height      : '100%',
                    plugins: [
                        {
                            ptype           : 'gridfilters'
                        },
                        {
                            ptype			: 'cellediting',
                            clicksToEdit	: 1,
                            default         : 'textfield',
                            triggerEvent    : 'cellclick'
                        },
                        {
                            ptype           : 'selectionreplicator'
                        },
                        {
                            ptype           : 'clipboard'
                        }
                    ],
                    columns : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            dataIndex   : 'nombre',
                            text        : 'Competencia/Dimensión',
                            flex        : 3,
                            editor      : {
                                allowBlank		: false,
                                selectOnFocus 	: true
                            }
                        },
                        {
                            dataIndex   : 'valor',
                            text        : 'Valor',
                            editor      : defaultEditor,
                            width       : 70
                        },
                        {
                            dataIndex   : 'año',
                            width       : 60,
                            text        : 'Año'
                        }
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype		: 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype	: 'saveButton',
                            itemId	: 'btnSave',
                            iconAlign	: 'left',
                            handler : function (btn) {
                                var
                                    win     = btn.up('window'),
                                    store   = win.down('grid').getStore(),
                                    me      = Admin.getApplication();
                                if (store.getModifiedRecords().length > 0) {
                                    store.sync();
                                }else {
                                    me.showResult('No hay cambios')
                                }
                            }
                        },'-',
                        {
                            xtype	: 'closebutton',
                            itemId	: 'btnUndo',
                            iconAlign	: 'left'
                        }
                    ]
                }
            ]
        }
    ]
});