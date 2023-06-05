/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

Ext.define('Admin.view.admin.JornSedesInView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'admin',
    alias       : 'widget.JornSedesInView',
    height	    : 450,
    width       : 380,
    closeAction : 'hide',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewStudyDay());
    },
    items       : [
        {
            xtype   : 'customform',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'JornadasStore',
                    iconCls     : '',
                    plugins: [
                        {
                            ptype           : 'gridfilters'
                        },
						{
							ptype			: 'gridSearch',
							readonlyIndexes	: ['note'],
							disableIndexes	: ['pctChange'],
							mode            : 'local',
							flex			: 1,
							autoFocus		: false,
							independent		: true
						}
                    ],
                    columns : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            dataIndex: 'jornada',
                            text        : 'Nombre de la jornada',
                            flex       	: 1
                        },
						{
							xtype		: 'checkcolumn',
							dataIndex   : 'estado',
							text        : 'Activa',
							width      	: 70,
							disabled	: true
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
                            handler: function (btn) {
                                var me = Admin.getApplication(),
                                    win = btn.up('window'),
                                    grid = win.down('grid'),
                                    store = Ext.getStore('JornSedesStore'),
                                    select = grid.getSelection(),
                                    param = me.getParamStore('JornSedesStore'),
                                    x = 0;
                                me.onMsgWait();
                                for (x = 0; x < select.length; x++) {
                                    var
                                        data = select[x];
                                    store.insert(0,
                                        {
                                            id_sede     : param.sede,
                                            id_jornada  : data.get('cod_jorn')
                                        }
                                    );
                                }
                                store.sync({
                                    callback: function (req, res) {
                                        store.reload();
                                    }
                                });
                                me.onMsgClose();
                                win.close();
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
