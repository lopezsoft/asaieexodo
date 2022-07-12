/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.view.academico.inscripciones.NoveltyView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.NoveltyView',
    requires: [
        'Admin.store.inscripciones.NoveltyStore',
        'Admin.view.academico.inscripciones.forms.NoveltyFormView'
    ],
    config : {
		record : null
	},
    controller: 'academico',
    initComponent: function () {
        var me  = Admin.getApplication();
        me.onStore('general.EstadoStore');
        me.onStore('inscripciones.NoveltyStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewNovelty());
    },
    buildWindow: function () {
        this.winObject = Ext.create('Admin.view.academico.inscripciones.forms.NoveltyFormView');
    },
    showWindow: function (btn) {
        var me = this.app,
            ts = this,
            data = ts.down('grid').getSelection()[0],
            form = [];
        if (!ts.getWinObject()) {
            ts.buildWindow();
        }
        // if (ts.getRecord().get('promoted') && btn.itemId == 'addButton') {
        //     me.showResult(AppLang.getSMgsDoNotEditEnrollment());
        // }else{
		form = ts.winObject.down('form');
		if (btn.itemId == 'editButton') {
			form.loadRecord(data);
			form.down('#CbEstado').setDisabled(true);
		} else {
			form.reset(true);
			form.down('#CbEstado').setDisabled(false);
		};
		ts.winObject.setRecord(ts.getRecord());
		ts.winObject.setAlwaysOnTop(true).show();
        // }
    },
    showSaveButton  : false,
    items: [
        {
            xtype       : 'customgrid',
            plugins		: [
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype : 'responsive'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: true,
                    independent		: true
                }
            ],
            store       : 'NoveltyStore',
            columns     : [
                {
                    xtype   : 'customrownumberer'
                },
                {
                    text        : 'Fecha',
                    dataIndex   : 'date',
                    width       : 120,
                    filter      : 'list'
                },
                {
                    text        : 'Motivo',
                    dataIndex   : 'motive',
                    flex        : 2,
                    filter      : 'string'
                }
            ],
            dockedItems : [
                {
                    xtype   : 'toolbarCrud',
                    items   : [
                        {
                            xtype   : 'addButton'
                        },'-',
                        {
                            xtype   : 'editButton'
                        },'-','->',
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                },
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar'
                }
            ]
        }
    ]
});
