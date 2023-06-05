Ext.define('Admin.view.docentes.EvaluationCreate', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    bodyPadding : 0,
    cls         : 'kpi-main',
    xtype       : 'evaluationcreate',
    layout      : 'responsivecolumn',
    alias       : 'widget.evaluationcreate',
    reference   : 'evaluationcreate',

    config: {
        activeState     : null,
        record          : null,
        totalQuestions  : 0,
        newItems        : []
    },
    controller: 'actividades',
    scrollable  : 'y',
    minWidth    : 600,
    initComponent : function(){
        let 
            me      =  this,
            record  = me.getRecord();
        if(!record){
            me.getController().redirectTo('evaluaciones', true);
        }else{
            me.items = me.getNewItems();
        }
        me.callParent(arguments);
    },
    dockedItems:[{
        xtype   : 'customtoolbar',
        dock    : 'top',     
        items: [
            '->',
            {
                xtype       : 'closebutton'
            }
        ]
    }],
    validStates: {
        clicks: 1,
        redemption: 1,
        sales: 1,
        goalsmet: 1
    },

    isValidState: function (state) {
        return state in this.validStates;
	},
	afterRender: function () {
        var me = this;

        me.callParent(arguments);

        me.syncSize();

        // Since we want to always be a %age of the modalViewort, we have to watch for
        // resize events.
        Ext.on(me.resizeListeners = {
            resize: me.onViewportResize,
            scope: me,
            buffer: 50
        });
	},

	onViewportResize: function () {
        this.syncSize();
    },

    syncSize: function () {
		let me  	= this,
			win		= me.down('window'),
			height = Ext.Element.getViewportHeight();

		this.setMaxHeight(height - 148);
    }
});
