Ext.define('Admin.view.configuraciones.areas.Areas',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.promotionAreas',
    xtype   : 'promotionAreas',
    controller : 'configuraciones',
    initComponent: function () {
        var 
            me  = Admin.getApplication(),
            ts  = this;
        me.onStore('general.PromotionAreasStore');
        me.onStore('general.AreasStore');
        me.setParamStore('PromotionAreasStore',{
            pdbTable    : 'promotion_areas',
            pdbId       : ts.getRecord().get('id')
        },true);
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewAreas());
    },
    buildWindow: function () {
        this.winObject = Ext.create('Admin.view.configuraciones.areas.AreasView');
    },
    config  : {
        record : null
    },
    showWindow: function (btn) {
        var
            ts = this,
            data = ts.down('grid').getSelection()[0],
            form = [];
        if (!ts.getWinObject()) {
            ts.buildWindow();
        }
        form = ts.winObject.down('form');
        if (btn.itemId == 'editButton') {
            form.loadRecord(data);
        } else {
            form.reset(true);
        };
        ts.winObject.setRecord(ts.getRecord());
        ts.winObject.show();
    },
    store: 'PromotionAreasStore',
    items   : [{
        xtype       : 'customgrid',
        plugins		: [
            {
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate(
                    '<p><b>Nombre:</b> {nombre}</p>'
                )
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
        store       : 'PromotionAreasStore',
        autoLoad    : false,
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Área',
                dataIndex   : 'area',
                flex        : 4
            },
            {
                text        : 'Año',
                dataIndex   : 'year',
                width       : 60
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
                    },'-',
                    {
                        xtype   : 'deletebutton'
                    },'-',
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
    }]
});