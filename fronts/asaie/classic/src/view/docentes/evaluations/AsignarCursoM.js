Ext.define('Admin.view.docentes.AsignarCursoM', {
    extend: 'Admin.base.CustomWindow',
    alias: 'widget.asignarcursom',
    xtype: 'asignarcursom',
    controller: 'actividades',
    maxHeight: 180,
    store: 'CargaStore',
    initComponent: function() {
        var me = this,
            zstore = Ext.create('Admin.store.base.StoreUrl', {
                model: 'Admin.model.docentes.CargaModel',
                proxy: {
                    type: 'ajax',
                    url: 'activities/getAsignacionAct',
                    extraParams: {
                        id: me.getRecord().get('id'),
                        type: 1
                    }
                },
                autoLoad: true
            });
        me.items = [{
            xtype: 'customform',
            items: [{
                xtype: 'customcombobox',
                fieldLabel: '',
                store: zstore,
                valueField: 'grado',
                minChars: 2,
                flex: 1,
                emptyText: 'Seleccione por favor...',
                tpl: Ext.create('Ext.XTemplate',
                    '<ul class="x-list-plain"><tpl for=".">',
                    '<li role="option" class="x-boundlist-item">{grado} - {grupo} - {asignatura} - {jornada} - {sede}</li>',
                    '</tpl></ul>'
                ),
                // template for the content inside text field
                displayTpl: Ext.create('Ext.XTemplate',
                    '<tpl for=".">',
                    '{grado} - {grupo} - {asignatura} - {jornada} - {sede}',
                    '</tpl>'
                )
            }]
        }];
        me.callParent(arguments);
    },
    saveData: function(storeName, reload) {
        var app = this.getApp(),
            me = this,
            record = me.getRecord(),
            course = me.down('customcombobox').getSelection(),
            socket = Global.getSocket();

        socket.emit('insertData', {
            dataName: Global.getDbName(),
            table: 'ta_courses_online_activities',
            values: {
                activity_id: record.get('id'),
                course_id: course.get('id')
            }
        }, function(err, res, id) {
            if (err) {
                app.showResult('Error al asignar el curso', 'error');
                socket.close();
            } else {
                app.showResult('El curso ha sido asignado.');
                socket.emit('sendActivity', {
                    id: id,
                    cfg: Global.getCfg()
                }, function() {
                    socket.close();
                });
                me.close();
            }
        });
    }
});