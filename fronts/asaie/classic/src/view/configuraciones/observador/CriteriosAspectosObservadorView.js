/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.CriteriosAspectosObservadorView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.criteriosaspectosobservadorview',
    requires    : [
        'Admin.view.configuraciones.CriteriosAspectosObservadorSaveView'
    ],
    maxHeight   : 400,
    maxWidth    : 650,
    config      : {
        record  : null
    },
    showWindow  : function(btn){
        win     = Ext.create('Admin.view.configuraciones.CriteriosAspectosObservadorSaveView');
		let record;
		if (btn.itemId == 'editButton') {
			record = btn.up('window').down('grid').getSelection()[0];
			form = win.down('form');
			form.loadRecord(record);
		}
        win.down('#id_item_modelo').setValue(this.getRecord().get('id'));
        win.show();
    },
    items       : [
        {
            xtype       : 'customgrid',
            store       : 'CriteriosAspectosObservadorStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>'
                    )
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: true,
                    independent		: true
                }
            ],
            iconCls     : '',
            columns : [
                {
                    xtype   : 'customrownumberer'
                },
                {
                    dataIndex   : 'descripcion',
                    text        : 'Descripción',
                    flex        : 2
                },
                {
                    xtype       : 'checkcolumn',
                    disabled    : true,
                    dataIndex   : 'estado',
                    text        : 'Activo',
                    width       : 70
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype       : 'toolbarCrud',
                    items 	: [
                        {
                            xtype	: 'addButton'
                        },'-',
                        {
                            xtype	: 'editButton'
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
