Ext.define('Admin.view.estudiantes.CommentsActivities', {
    extend          : 'Ext.panel.Panel',
    uses: [
        'Ext.layout.container.Border',
        'Ext.layout.container.Fit'
    ],
    config          :  {
        activityId      : 0,
        record          : null,
        activityName    : '',
        newItems        : []
    },
    alias       : 'widget.commentsactivities',
    controller  : 'estudiantes',
    cls         : 'quarterly-main',
    userCls     : 'small-100 big-100',
    flex        : 1,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    scrollable: 'y',
    initComponent : function(){
        let me = this;
        if(!me.getActivityId() > 0){
            me.getController().redirectTo('studentsactivities', true);
        }else{
            me.items    = me.getNewItems(),
            me.tbar = [
                '->',
                '-',
                {
                    xtype       : 'closebutton'
                }
            ];
        }
        me.callParent(arguments);
        me.setTitle('Comentarios de la actividad: ' + me.getActivityName());
    }
});