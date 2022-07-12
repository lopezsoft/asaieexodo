Ext.define('Admin.view.docentes.ClassCourseStudents',{
    extend          : 'Ext.panel.Panel',
    alias  	        : 'widget.classcoursestudents',
    config          :  {
        classId      	: 0,
        className    	: '',
        courseId        : 0,
        record          : null
    },
    cls         : 'quarterly-main',
    userCls     : 'small-100 big-100',
    flex        : 1,
    controller  : 'teacherliveclasses',
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    scrollable: 'y',
    initComponent   : function(){
        let me      = this;
        if(!me.getClassId() > 0){
            me.getController().redirectTo('teacherliveclasses', true);
        }else{
            let classcoursestudentsstore  = Ext.create('Admin.store.base.StoreUrl',{
                model		: 'Admin.model.docentes.CargaModel',
                proxy: {
                    type	: 'ajax',
                    url     : 'liveClasses/getStudentsByCourses',
                    extraParams : {
                        classId    	: me.getClassId(),
                        courseId	: me.getCourseId()
                    }
                },
                autoLoad: true
            });
            me.items    = [
                {
                    xtype       : 'dataview',
                    store       : classcoursestudentsstore,
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
                                '<div class="statement-header">{grado} - {grupo} - {jornada} - {asignatura} </div>',
                                '<div class="thumb-icon-student"></div>',
                                    '<div class="thumb-title-container">',
                                        '<div class="thumb-title">{estudiante}</div>',
                                        '<div class="thumb-title-small">SEDE: {sede}</div>',
                                    '</div>',
                                    '<a class="thumb-return" href="#coursesliveclasses" target="_self"></a>',
                                '</div>',
                            '</div>',
                        '</tpl>'
                    ]
                }
            ],
            me.tbar = [
                {
                    xtype       : 'label',
                    text        : me.getClassName()
                },
                '-',
                {
                    xtype       : 'customtext',
                    name        : 'filter',
                    fieldLabel  : '',
                    labelWidth  : 2,
                    flex        : 1,
                    listeners: {
                        scope : this,
                        buffer: 200,
                        change: this.filter
                    }
                },'-',
                '->',
                {
                    iconCls     : 'fas fa-sync-alt',
                    ui          : 'header-blue',
                    handler     : function(btn){
                        if(btn.up('panel').down('dataview')){
                            btn.up('panel').down('dataview').getStore().reload();
                        }
                    }
                },
                {
                    xtype       : 'closebutton'
                }
            ];
        }
        me.callParent(arguments);
    },
    /**
     * @private
     * Called whenever the user types in the Filter textfield. Filters the DataView's store
     */
    filter: function(field, newValue) {
        let view        = this.down('dataview'),
            store       = view.getStore(),
            selModel    = view.getSelectionModel(),
            selection   = selModel.getSelection()[0];
        store.getFilters().replaceAll({
            property: 'estudiante',
            anyMatch: true,
            value   : newValue
        });
        if (selection && store.indexOf(selection) === -1) {
            selModel.clearSelections();
        }
    }
});
