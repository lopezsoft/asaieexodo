Ext.define('Admin.view.docentes.EvaluationCourses',{
    extend          : 'Ext.panel.Panel',
    alias  	        : 'widget.evaluationcourses',
    config          :  {
        evaluationId    : 0,
        evaluationName  : '',
        record          : null
    },
    cls         : 'quarterly-main',
    userCls     : 'small-100 big-100',
    flex        : 1,
    controller  : 'actividades',
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    scrollable: 'y',
    initComponent   : function(){
        let me      = this;
        if(!me.getEvaluationId() > 0){
            me.getController().redirectTo('evaluaciones', true);
        }else{
            let zstore  = Ext.create('Admin.store.base.StoreApi',{
                model		: 'Admin.model.docentes.CargaModel',
                proxy: {
                    type	: 'ajax',
                    api: {
                        create  : 'evaluations/insertData',
                        read    : 'evaluations/getAsignacionEval',
                        update  : 'master/updateData',
                        destroy : 'master/deleteData'
                    },
                    extraParams : {
                        pdbTable: 'te_evaluation_courses',
                        id      : me.getEvaluationId(),
                        type    : 2
                    }
                },
                autoLoad: true
            });
            me.items    = [
                {
                    xtype       : 'dataview',
                    store       : zstore,
                    liveDrag    : true,
                    overItemCls : 'phone-hover',
                    cls         : 'quarterly-dataview',
                    itemSelector: 'div.thumb-wrap',
                    tpl: [
                        '<tpl for=".">',
                            // Break every four quarters
                            '<tpl if="xindex % 1 === 1">',
                                '<div class="statement-type">{year} </div>',
                            '</tpl>',
                            
                            '<div class="thumb-wrap">',
                            '<div class="thumb">',
                                '<div class="statement-header">{grado} - {grupo} - {jornada} </div>',
                                '<div class="thumb-icon"></div>',
                                    '<div class="thumb-title-container">',
                                        '<div class="thumb-title">{asignatura}</div>',
                                        '<div class="thumb-title-small">SEDE: {sede}</div>',
                                    '</div>',
                                    '<a class="thumb-return" href="#evaluaciones" target="_self"></a>',
                                '</div>',
                            '</div>',
                        '</tpl>'
                    ],
                    listeners   : {
                        scope           : this,
                        select          : this.select,
                        deselect        : this.deselect
                    }
                }
            ],
            me.tbar = [
                {
                    xtype       : 'label',
                    text        : me.getEvaluationName()
                },
                '->',
                {
                    iconCls     : 'fas fa-sync-alt',
                    ui          : 'header-blue',
                    handler     : function(btn){
                        if(btn.up('panel').down('dataview')){
                            btn.up('panel').down('dataview').getStore().reload();
                        }
                    }
                },'-',
                {
                    text    : 'Resultados',
                    iconCls : 'fas fa-poll',
                    ui      : 'header-blue',
                    itemId  : 'viewresults',
                    disabled: true,
                    tooltip : 'Ver resultados obtenidos por los estudiantes.',
                    handler : 'viewResults'
                },'-',
                {
                    text    : 'Lista de estudiantes',
                    iconCls : 'fas fa-user-graduate',
                    ui      : 'header-blue',
                    itemId  : 'viewstudents',
                    disabled: true,
                    tooltip : 'Ver lista de estudiantes',
                    handler : 'viewStudents'
                },'-',
                {
                    xtype       : 'deletebutton',
                    tooltip     : 'Borrar curso',
                    handler     : 'onDeleteView'
                },'-',
                {
                    xtype       : 'closebutton'
                }
            ];
        }
        me.callParent(arguments);
    },
    select      : function(view, record){
        this.setRecord(record);
        this.down('#deletebutton').setDisabled(false);
        this.down('#viewstudents').setDisabled(false);
        this.down('#viewresults').setDisabled(false);
    },
    deselect    : function(view, record){
        this.down('#deletebutton').setDisabled(false);
        this.down('#viewstudents').setDisabled(false);
        this.down('#viewresults').setDisabled(false);
    }
});
