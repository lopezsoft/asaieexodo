/**
 * Created by LOPEZSOFT on 6/01/2016.
 */
Ext.define('Admin.view.docentes.EvaluacionesPreguntasEditView',{
    extend  : 'Admin.base.WindowCrud',
    alias  	: 'widget.EvaluacionesPreguntasEditView',
    width	: 700,
    height	: 550,
    defaultFocus    : 'customtextarea',
    controller      : 'actividades',
    itemsCount      : 0,
    defaultListenerScope: true,
    items 	: [
        {
            xtype   : 'customform',
            defaultType : 'customhtmleditor',
            items   : [
                {
                    name        : 'descripcion',
                    fieldLabel 	: 'Descripción o enunciado de la pregunta',
                    value       : 'Descripción o enunciado de la pregunta',
                    labelAlign  : 'top',
                    height      : 250
                },
                {
                    name        : 'pregunta',
                    fieldLabel  : 'Título de la pregunta',
                    emptyText 	: 'Título de la pregunta',
                    labelAlign  : 'top',
                    reference   : 'np',
                    publishes   : 'value',
                    value       : 'Pregunta sin título',
                    height      : 150
                },
                {
                    xtype       : 'fieldcontainer',
                    layout      : 'hbox',
                    items       : [
                        {
                            xtype       : 'CbTipoPreguntas',
                            name        : 'tipo',
                            flex        : 1,
                            disabled    : true,
                            listeners   : {
                                select : function (c, r){
                                    var
                                        me  = c.up('window');
                                   // me.onQuestion(r.get('id'));
                                }
                            }
                        },
                        {
                            xtype       : 'customnumberfield',
                            name        : 'valor',
                            itemId      : 'ptos_preg',
                            margin      : '0 0 0 1',
                            fieldLabel  : 'Puntos posibles',
                            emptyText   : '0.00',
                            readOnly    : true,
                            width       : 170,
                            labelWidth	: 110
                        }
                    ]
                },
                {
                    xtype       : 'fieldset',
                    title       : 'Respuestas',
                    itemId      : 'resp',
                    hidden      : true,
                    items       : [

                    ]
                }
            ],
            dockedItems: [{
                xtype		: 'toolbarSave',
                items 	: [
                    {
                        xtype	: 'facebookButton'
                    },
                    {
                        xtype	: 'youtubeButton'
                    },
                    {
                        xtype   : 'label',
                        itemId  : 'lbTotal',
                        hidden  : true,
                        text    : 'Pregunta 0 de 0'
                    },
                    '->',
                    {
                        xtype   : 'customButton',
                        ui      : 'soft-purple',
                        iconCls : 'x-fa fa-plus',
                        hidden      : true,
                        tooltip : 'Agregar respuesta',
                        handler : 'onOneQuestion'
                    },'-',
                    {
                        xtype       : 'customButton',
                        iconCls     : 'x-fa fa-trash',
                        ui          : 'soft-red',
                        tooltip     : 'Borrar respuestas',
                        hidden      : true,
                        handler     : function (btn) {
                            var
                                win     = btn.up('window');
                            Ext.Msg.show({
                                title	: 'Elimiar respuestas',
                                message	: 'Desea eliminar todas las respuestas?',
                                buttons	: Ext.Msg.YESNO,
                                icon	: Ext.Msg.QUESTION,
                                fn      : function(btn) {
                                    if (btn === 'yes') {
                                        win.onDeleleAll();
                                    }
                                }
                            });
                        }
                    },'-',
                    {
                        xtype	    : 'saveButton',
                        itemId	    : 'btnSave',
                        iconAlign	: 'left',
                        handler     : 'onSave'
                    },'-',
                    {
                        xtype	: 'closebutton',
                        itemId	: 'btnUndo',
                        iconAlign	: 'left'
                    }
                ]
            }]
        }
    ],
    listeners : {
        afterrender : function (c) {
           // this.onValorPregunta();
          //  this.onNumQuestion();
        }
    },
    onNumQuestion : function () {
        var
            me      = this,
            gb      = globales.General,
            record  = Ext.ComponentQuery.query('EvaluacionesView')[0].down('grid').getSelection()[0],
            data    = {
                id  : record.get('id')
            },
            socket  = gb.getSocket();
            socket.emit('total-preguntas-evaluacion',data,gb.cfg());
            socket.on('receiveTotalPreguntasEvaluacion',function (d,c) {
                if (gb.compareObjects(gb.cfg(),c)){
                    cn  = d[0].total + 1;
                    me.down('#lbTotal').setText('Pregunta '+cn.toString()+' de '+record.get('num_preguntas').toString());
                }
            });
    },
    onOneQuestion : function (btn) {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp'),
            i   = me.down('CbTipoPreguntas').value;
        switch (i) {
            case '1' :
                Ext.onReady(function () {
                    me.onAddOpen();
                });
                break;
            case '2' :
                Ext.onReady(function () {
                    comp    = Ext.create('Admin.field.FieldContainerRadio',{
                        itemId  : 'Opcion'+me.itemsCount.toString()
                    });
                    txt2 = comp.down('TextField');
                    txt2.setValue('Opción'+me.itemsCount.toString());
                    fs.add(comp);
                    me.itemsCount++;
                    me.down('form').setScrollY(me.height/2, true);
                });
                break;
            case '3' :
                Ext.onReady(function () {
                    comp    = Ext.create('Admin.field.FieldContainerCheck',{
                        itemId  : 'Opcion'+me.itemsCount.toString()
                    });
                    txt2 = comp.down('TextField');
                    txt2.setValue('Opción'+me.itemsCount.toString());
                    fs.add(comp);
                    me.itemsCount++;
                    me.down('form').setScrollY(me.height/2, true);
                });
                break;
            default :
                Ext.onReady(function () {
                    me.onAddTrueFalse();
                });
                break;
        }
    },
    onQuestion : function (i) {
        var
            me  = this;
        switch (i) {
            case '1' :
                Ext.onReady(function () {
                    me.onAddOpen();
                });
                break;
            case '2' :
                Ext.onReady(function () {
                    me.onAddRadio();
                });
                break;
            case '3' :
                Ext.onReady(function () {
                    me.onAddCheck();
                });
                break;
            default :
                Ext.onReady(function () {
                    me.onAddTrueFalse();
                });
                break;
        }
    },
    onDeleteObj : function (obj) {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        Ext.Msg.show({
            title	: 'Elimiar respuesta',
            message	: 'Desea eliminar la respuesta?',
            buttons	: Ext.Msg.YESNO,
            icon	: Ext.Msg.QUESTION,
            fn      : function(btn) {
                if (btn === 'yes') {
                    fs.remove(obj,{destroy : true});
                }
            }
        });
    },
    onDeleleAll : function () {
       var me  = this,
            comp= null,
            fs  = me.down('#resp');
        fs.removeAll();
    },
    onAddOpen : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        me.onDeleleAll();
        me.itemsCount   = 1;
        me.onValorPregunta();
        comp    = Ext.create('Admin.field.FieldContainerText',{
            itemId  : 'Opcion'+me.itemsCount.toString()
        });
        fs.add(comp);
        valQ    = me.down('#ptos_preg').getValue();
        comp.down('customnumberfield').setValue(valQ);
        me.down('form').setScrollY(me.height/2, true);
    },
    onAddCheck : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        me.onDeleleAll();

        for (i = 0; i < 4; i++){
            comp    = Ext.create('Admin.field.FieldContainerCheck',{
                itemId  : 'Opcion'+i.toString()
            });
            txt = comp.down('TextField');
            txt.setValue('Opción'+i.toString());
            //txt.name = 'respuesta'+i.toString();
            fs.add(comp);
        }
        me.down('form').setScrollY(me.height/2, true);
        me.itemsCount   = 4;
        me.onValorPregunta();
    },
    onAddRadio : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        me.onDeleleAll();
        for (i = 0; i < 4; i++){
            comp    = Ext.create('Admin.field.FieldContainerRadio',{
                itemId  : 'Opcion'+i.toString()
            });
            txt = comp.down('TextField');
            txt.setValue('Opción'+i.toString());
            //txt.name = 'respuesta'+i.toString();
            fs.add(comp);
        }
        me.down('form').setScrollY(me.height/2, true);
        me.itemsCount   = 4;
        me.onValorPregunta();
    },
    onAddTrueFalse : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        me.onDeleleAll();
        me.itemsCount   = 1;
        comp    = Ext.create('Admin.field.FieldContainerRadio',{
            itemId  : 'Opcion'+me.itemsCount.toString()
        });
        txt = comp.down('TextField');
        txt.setValue('VERDADERO');
        txt.setReadOnly(true);
        comp.down('customButton').setDisabled(true);
        fs.add(comp);
        me.itemsCount   = 2;
        comp    = Ext.create('Admin.field.FieldContainerRadio',{
            itemId  : 'Opcion'+me.itemsCount.toString()
        });
        txt = comp.down('TextField');
        txt.setValue('FALSO');
        txt.setReadOnly(true);
        comp.down('customButton').setDisabled(true);
        fs.add(comp);

        me.down('form').setScrollY(me.height/2, true);
        me.onValorPregunta();
    },
    onCloseWin : function (btn) {
        this.onDeleleAll();
        this.getController().onCloseWin(btn);
    },
    onValorPregunta : function () {
        var gb      = globales.General,
            me      = this,
            data    = {
                id_inst : gb.id_inst,
                año     : gb.año
            },
            re  = 0,
            record  = Ext.ComponentQuery.query('EvaluacionesView')[0].down('grid').getSelection()[0],
            socket  = io.connect(gb.hostSocket);
            socket.emit('query-escala-alta',data);
            socket.on('receiveEscalaAlta', function (data) {
                if(data.length > 0){
                    re = data[0].hasta/record.get('num_preguntas');
                }
                me.down('#ptos_preg').setValue(re.toFixed(2));
                return re.toFixed(2);
            });
    },
    onValorRespuestaRd : function (btn) {
        var
            me          = this,
            fs          = me.down('#resp'),
            list        = fs.items.items,
            valQ        = 0,
            valR        = 0;
        this.onValorPregunta();
        if (btn.getValue()){
            valQ    = me.down('#ptos_preg').getValue();
            valR    = valQ;
            for (z = 0; z < list.length; z++) {
                obj = list[z];
                obj.down('customnumberfield').setValue(0);
                if (obj.getItemId() == btn.up('FieldContainerRadio').getItemId()){

                }else {
                    obj.down('customcheckboxfield').setValue(false);
                }
            }
            btn.up('FieldContainerRadio').down('customnumberfield').setValue(valR);
        }else {
            btn.up('FieldContainerRadio').down('customnumberfield').setValue(0);
        }
    },
    onValorRespuestaCk : function (btn) {
        var
            me          = this,
            fs          = me.down('#resp'),
            list        = fs.items.items,
            valQ        = 0,
            counTrue    = 0,
            valR        = 0;
        this.onValorPregunta();
        valQ    = me.down('#ptos_preg').getValue();
        for (i = 0; i < list.length; i++) {
            obj = list[i];
            if(obj.down('customcheckboxfield').getValue()){
                counTrue++;
            };
        }
        valR    = valQ / counTrue;
        for (z = 0; z < list.length; z++) {
            obj = list[z];
            if(obj.down('customcheckboxfield').getValue()){
                obj.down('customnumberfield').setValue(valR);
            }else {
                obj.down('customnumberfield').setValue(0);
            }
        }
    },
    onSave : function (btn) {
        var
            me      = this,
            cont    = me.getController(),
            app     = Admin.getApplication(),
            values  = me.down('form').getValues(),
            record  = me.down('form').getRecord();
            store   = Ext.getStore('EvaluationQuestionsStore');
        cont.onDataSave(record,values,store,values,me);
    }
});