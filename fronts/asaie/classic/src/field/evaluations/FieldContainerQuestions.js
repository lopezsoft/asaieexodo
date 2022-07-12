Ext.define('Admin.field.FieldContainerQuestions', {
    extend: 'Ext.form.FieldContainer',
    labelStyle: 'font-weight:bold',
    layout: 'anchor',
    alias: 'widget.fieldcontainerquestions',
    config: {
        questionId: 0,
        record: {}
    },
    defaultListenerScope: true,
    items: [{
        xtype: 'fieldSet',
        labelStyle: 'font-weight:bold',
        title: 'Digite una respuesta'
    }],
    initComponent: function() {
        let me = this,
            app = Admin.getApplication();
        me.callParent();

        let
            fs = me.down('fieldset'),
            record = me.record,
            socket = Global.getSocket(),
            data = [],
            sql = '',
            type = parseInt(record.type_id);
        sql = "SELECT * FROM te_evaluation_answers WHERE question_id = " + record.id + " ORDER BY RAND()";
        socket.emit('sqlQuery', {
            dataName: Global.getDbName(),
            sql: sql
        }, function(err, res) {
            if (err) {
                app.showResult('Error al crear las respuestas de la pregunta: ' + record.pregunta);
                return;
            }
            if (!fs) {
                app.showResult('No es posible crear las respuestas de la pregunta: ' + record.pregunta);
                return;
            }
            if (res.length > 0) {
                if (type > 1) {
                    res.forEach(ele => {
                        ob = {
                            boxLabel: ele.respuesta,
                            inputValue: ele.valor,
                            name: 'answer',
                            answerId: ele.id,
                            correct: ele.verdadera
                        };
                        data.push(ob);
                    });
                }
                switch (type) {
                    /*General o abierta*/
                    case 1:
                        fs.setTitle('Digite una respuesta');
                        fs.add({
                            xtype: 'customtextarea',
                            name: 'answer',
                            answerId: res[0]['id'],
                            correct: res[0]['verdadera'],
                            emptyText: 'Digite la descripción de la respuesta',
                            listeners: {
                                change: function(me) {
                                    me.up('window').changerequest(me.up('form').getItemId());
                                }
                            }
                        });
                        break;
                        /*Selección múltiple con única respuesta*/
                    case 2:
                        fs.setTitle('Seleccione una respuesta');
                        fs.add({
                            xtype: 'customradiogroup',
                            items: data,
                            listeners: {
                                change: function(me, n) {
                                    me.up('window').changerequest(me.up('form').getItemId());
                                }
                            }
                        });
                        break;
                        /*Selección múltiple con múltiple respuesta*/
                    case 3:
                        fs.setTitle('Seleccione una o más respuestas');
                        fs.add({
                            xtype: 'customcheckboxgroup',
                            items: data,
                            listeners: {
                                change: function(me, n) {
                                    me.up('window').changerequest(me.up('form').getItemId());
                                }
                            }
                        });
                        break;
                        /*FALSO/VERDADERO*/
                    case 4:
                        fs.setTitle('Seleccione una respuesta');
                        fs.add({
                            xtype: 'customradiogroup',
                            items: data,
                            listeners: {
                                change: function(me, n) {
                                    me.up('window').changerequest(me.up('form').getItemId());
                                }
                            }
                        });
                        break;
                }
            }
        });
    }
});