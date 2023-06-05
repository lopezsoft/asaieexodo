Ext.define('Admin.view.docentes.EvaluationPanel',{
    extend          : 'Ext.form.Panel',
    alias  	        : 'widget.evaluationpanel',
    minHeight	    : 250,
    config          :  {
        oldCls          : 'x-fieldset',
        record          : null, // Contiene en registro de la evaluación
        questionId      : 0, // Contiene el número de la pregunta
        dataId          : 0, // Identificador de la base de datos se obtiene luego de guardar la pregunta
        questionStatus  : 0, // Estado del cambio de la pregunta: 1 = sin guadar, 2 =  guardada, 0 = inicial
        itemsCount      : 0,
        typeQuestion    : 0,
        info            : ''
    },
    formBind    : true,
    bodyCls     : 'statistics-body shadow',
    userCls     : 'small-100 big-100',
    flex        : 1,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    initComponent   : function(){
        let me      = this;
        me.items    = [
            {
                xtype       : 'customhtmleditor',
                enableFont  : true,
                name        : 'question_name',
                fieldLabel  : 'Título de la pregunta',
                hideLabel   : true,
                emptyText 	: 'Pregunta sin título',
                labelAlign  : 'top',
                value       : 'Pregunta sin título',
                height      : 100
            },
            {
                xtype       : 'customcontainer',
                items       : [
                    {
                        xtype       : 'cbtypequestions',
                        listeners   : {
                            change  : function(ts, nVal, oVal){
                                let
                                me  = ts.up('form');
                                me.onQuestion(nVal, oVal);
                            }
                        }
                    },
                    {
                        xtype       : 'customnumberfield',
                        name        : 'question_points',
                        itemId      : 'ptos_preg',
                        margin      : '0 0 0 1',
                        fieldLabel  : '% posible',
                        labelAlign  : 'left',
                        emptyText   : '0.00',
                        value       : '100',
                        readOnly    : true,
                        maxWidth    : 150,
                        minWidth    : 150,
                        labelWidth	: 90
                    }
                ]
            },
            {
                xtype       : 'fieldset',
                title       : 'Respuestas',
                itemId      : 'resp'
            }
        ],
        me.bbar = [
            {
                xtype   : 'label',
                itemId  : 'lbTotal',
                text    : me.getInfo()
            },
            '->',
            {
                xtype   : 'customButton',
                ui      : 'soft-purple',
                iconCls : 'x-fa fa-plus',
                formBind: true,
                tooltip : 'Agregar respuesta',
                handler : function(btn){
                    btn.up('form').onOneQuestion(btn);
                }
            },'-',
            {
                xtype       : 'customButton',
                iconCls     : 'x-fa fa-trash',
                ui          : 'soft-red',
                formBind    : true,
                tooltip     : 'Borrar pregunta y respuestas',
                handler     : function (btn) {
                    btn.up('form').onDeleleAll(btn);
                }
            },'-',
            {
                xtype	    : 'saveButton',
                iconAlign	: 'left',
                handler     : function(btn){
                    btn.up('form').onSave(btn);
                }
            }
        ];

        me.callParent(arguments);
    },
    onOneQuestion : function (btn) {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp'),
            i   = me.down('cbtypequestions').value;
        me.mask();
        switch (i) {
            case '1' :
                me.onAddOpen();
                break;
            case '2' :
                comp    = Ext.create('Admin.field.MultipleChoiceQuestion',{
                    itemId  : 'Option' + me.getId() + me.getItemsCount().toString()
                });
                txt2 = comp.down('customtext');
                txt2.setValue('Opción' + me.getItemsCount().toString());
                fs.add(comp);
                me.setItemsCount(me.getItemsCount() + 1);
                break;
            case '3' :
                comp    = Ext.create('Admin.field.MultipleQuestionAnswer',{
                    itemId  : 'Option' + me.getId() + me.getItemsCount().toString()
                });
                txt2 = comp.down('customtext');
                txt2.setValue('Opción' + me.getItemsCount().toString());
                fs.add(comp);
                me.setItemsCount(me.getItemsCount() + 1);
                break;
            default :
                me.onAddTrueFalse();
                break;
        }
        me.unmask()
    },
    onQuestion : function (i) {
        var
            me  = this;
        me.mask();
        switch (i) {
            case '1' :
                me.onAddOpen();
                break;
            case '2' :
                me.onAddRadio();
                break;
            case '3' :
                me.onAddCheck();
                break;
            case '4' :
                me.onAddTrueFalse();
                break;
        }
        me.changeCls(1);
        me.unmask();
    },
    changeCls : function (val) {
        let 
            cls = '',
            me  = this;
        switch (val) {
            case 1:
                cls = 'fieldset-red';
                break;
            case 2:
                cls = 'fieldset-green';
                break;
            default:
                cls = 'fieldset-default';
                break;
        }  
        if(cls != me.getOldCls()){
            me.setQuestionStatus(val);
            me.down('fieldset').removeCls(me.getOldCls());
            me.down('fieldset').addCls(cls);
            me.setOldCls(cls);
        }
    },
    onDeleteObj : function (obj) {
        var
            me      = this,
            app     = Admin.getApplication(),
            fs      = me.down('#resp'),
            items   = fs.items.items;
        if (items.length > 2) {
            if(obj.getAnswerId() > 0){
                socket  = Global.getSocket();
                socket.emit('deleteData',{
                    dataName    : Global.getDbName(),
                    table       : 'te_evaluation_answers',
                    values      : {id : obj.getAnswerId()}
                },(err, res)=>{
                    if (err) {
                        app.showResult('Error al borrar la respuesta.','error');
                    }else{
                        fs.remove(obj,{destroy : true});
                    }
                });
            }else{
                fs.remove(obj,{destroy : true});
            }
        }
    },
    onDeleleAll : function () {
        let 
            me  = this,
            app = Admin.getApplication();
        // Si la pregunta ya ha sido guardada
        if(me.getDataId() > 0){
            socket  = Global.getSocket();
            socket.emit('deleteData',{
                dataName    : Global.getDbName(),
                table       : 'te_evaluation_questions',
                values      : {id : me.getDataId()}
            },(err, res) =>{
                if (err) {
                    app.showResult('Error al borrar la pregunta','error');
                }else{
                    deleteOb(me);
                    app.showResult('Petición realizada correctamente.');
                    me.down('cbtypequestions').setDisabled(false);
                }
            });
        }else{
            deleteOb(me);
        };
        function deleteOb (me){
            me.down('#resp').removeAll(true);
            me.down('cbtypequestions').setValue(0);
            me.down('customhtmleditor').setValue('Pregunta sin título');
            me.changeCls(0);
            me.setTypeQuestion(0);
            me.setDataId(0);
        };
    },
    onAddOpen : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        fs.removeAll(true);
        me.getItemsCount(1);
        me.onValorPregunta();
        comp    = Ext.create('Admin.field.QuestionTypeText',{
            itemId  : 'Option' + me.getId() +  +me.getItemsCount().toString()
        });
        fs.add(comp);
        valQ    = me.down('#ptos_preg').getValue();
        comp.down('customnumberfield').setValue(valQ);
    },
    onAddCheck : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        fs.removeAll(true);

        for (i = 0; i < 4; i++){
            comp    = Ext.create('Admin.field.MultipleQuestionAnswer',{
                itemId  : 'Option'+ me.getId() +  i.toString()
            });
            comp.down('hidden').setValue('Option'+ me.getId() +  i.toString());
            comp.down('customtext').setValue('Opción ' + i.toString());
            fs.add(comp);
        }
        me.setItemsCount(4);
        me.onValorPregunta();
    },
    onAddRadio : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        fs.removeAll(true);
        for (i = 0; i < 4; i++){
            comp    = Ext.create('Admin.field.MultipleChoiceQuestion',{
                itemId  : 'Option' + me.getId() + i.toString()
            });
            comp.down('hidden').setValue('Option'+ me.getId() +  i.toString());
            comp.down('customtext').setValue('Opción ' + i.toString());
            fs.add(comp);
        }
        me.setItemsCount(4);
        me.onValorPregunta();
    },
    onAddTrueFalse : function () {
        var
            me  = this,
            comp= null,
            fs  = me.down('#resp');
        fs.removeAll(true);
        me.setItemsCount(1);
        comp    = Ext.create('Admin.field.MultipleChoiceQuestion',{
            itemId  : 'Option' + me.getId() + me.getItemsCount().toString()
        });
        txt = comp.down('customtext');
        txt.setValue('VERDADERO');
        txt.setReadOnly(true);
        comp.down('customButton').setDisabled(true);
        fs.add(comp);

        me.setItemsCount(2);
        comp    = Ext.create('Admin.field.MultipleChoiceQuestion',{
            itemId  : 'Option'+me.getItemsCount().toString()
        });
        txt = comp.down('customtext');
        txt.setValue('FALSO');
        txt.setReadOnly(true);
        comp.down('customButton').setDisabled(true);
        fs.add(comp);
        me.onValorPregunta();
    },
    onValorPregunta : function () {
		this.down('#ptos_preg').setValue(100);
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
            list.forEach(ele => {
                ele.down('customnumberfield').setValue(0);
                if (ele.getItemId() != btn.up('multiplechoicequestion').getItemId()){
                    ele.down('customcheckboxfield').setValue(false);
                }
            });
            btn.up('multiplechoicequestion').down('customnumberfield').setValue(valR);
        }else {
            btn.up('multiplechoicequestion').down('customnumberfield').setValue(0);
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
        list.forEach(ele => {
            if(ele.down('customcheckboxfield').getValue()){
                counTrue++;
            }; 
        });
        valR    = valQ / counTrue;
        list.forEach(ele => {
            if(ele.down('customcheckboxfield').getValue()){
                ele.down('customnumberfield').setValue(valR);
            }else {
                ele.down('customnumberfield').setValue(0);
            }
        });
    },
    onSave : function (btn) {
        let
            me      = this,
            app     = Admin.getApplication(),
            resp    = me.down('#resp'),
            values  = me.getValues(),
            items   = resp.items.items,
            gb      = Global,
            record  = me.up('panel').getRecord(),
            socket  = gb.getSocket(),
            quest_id= me.getDataId(id),
            pCorrec = false;

        if(quest_id > 0){ // Actualiza la pregunta existente
            dataP   = { 
                dataName: gb.getDbName(),
                table   : 'te_evaluation_questions',
                values  : [{
                    pregunta        : values.question_name,
                    num_respuestas  : items.length
                },{
                    id  : quest_id
                }]
            };
        }else{ // Nueva pregunta
            dataP   = { 
                dataName: gb.getDbName(),
                table   : 'te_evaluation_questions',
                values  : {
                    evaluation_id   : record.get('id'),
                    pregunta        : values.question_name,
                    valor           : values.question_points,
                    type_id         : values.type_question,
                    num_respuestas  : items.length,
                    estado          : 1
                }
            };
        }
        let 
            type_question = values.type_question ? values.type_question : me.getTypeQuestion();
        if (items.length == 0){
            app.showResult('No hay respuestas asignadas a la pregunta.','error');
        }else {
            me.mask('Guardando...');
            if (type_question == '1') { // Pregunta abierta o general
                if (quest_id > 0) {
                    let
                        answer  = me.down('questiontypetext');
                    // Actualiza la pregunta existente
                    socket.emit('updateData',dataP,(err, res)=>{
                        if(err){
                            app.showResult('Error al guardar la pregunta.','error');
                            me.unmask();
                            socket.close();
                        }else{
                            // Guarda la nueva respuesta
                            if(!answer.getAnswerId() > 0){
                                dataR = {
                                    dataName: gb.getDbName(),
                                    table   : 'te_evaluation_answers',
                                    values : {
                                        question_id	: quest_id,
                                        respuesta	: values.answer,
                                        valor		: values.points,
                                        verdadera	: 1,
                                        estado		: 1
                                    }
                                };
                                socket.emit('insertData',dataR,(err, res, id)=>{
                                    if(err){
                                        app.showResult('Error al guardar la respuesta.','error');
                                    }else{
                                        me.changeCls(2); // Cambia el estado de la pregunata a  guardada
                                        answer.setAnswerId(id); // Se guarda el id de la respuesta
                                        app.showResult('Petición realizada correctamente.');
                                    }
                                    socket.close();
                                    me.unmask();
                                });
                            }else{
                                me.unmask();
                                app.showResult('Petición realizada correctamente.');
                            }
                        }
                    });
                }else{
                    // Crear o guarda una nueva pregunta
                    socket.emit('insertData',dataP,(err, res, id)=>{
                        if(err){
                            app.showResult('Error al guardar la pregunta.','error');
                            me.unmask();
                            socket.close();
                        }else{
                            dataR = {
                                dataName: gb.getDbName(),
                                table   : 'te_evaluation_answers',
                                values : {
                                    question_id	: id,
                                    respuesta	: values.answer,
                                    valor		: values.points,
                                    verdadera	: 1,
                                    estado		: 1
                                }
                            };
                            me.setDataId(id); // Se guarda el id de la pregunta
                            socket.emit('insertData',dataR,(err, res, id)=>{
                                if(err){
                                    app.showResult('Error al guardar la respuesta.','error');
                                }else{
                                    me.changeCls(2); // Cambia el estado de la pregunata a  guardada
                                    me.down('questiontypetext').setAnswerId(id); // Se guarda el id de la respuesta
                                    me.down('cbtypequestions').setDisabled(true);
                                    me.setTypeQuestion(type_question);
                                    app.showResult('Petición realizada correctamente.');
                                }
                                socket.close();
                                me.unmask();
                            });
                        }
                    });
                }
            } else {
                // Verifica si hay una pregunta marcada como correcta
                values.correct.forEach(ele => {
                    if (ele == 1) {
                        pCorrec = true;
                        return false;
                    } 
                });

                if(!pCorrec){
                    me.unmask();
                    app.showResult('Debe establecer, al menos, una respuesta como verdadera');
                    return false;
                }
                if (quest_id > 0) { 
                    // Actualiza la pregunta existente
                    socket.emit('updateData',dataP,(err, res)=>{
                        if(err){
                            app.showResult('Error al guardar la pregunta.','error');
                            me.unmask();
                            socket.close();
                        }else{
                            items.forEach(ele => {
                                if(ele.getAnswerId() > 0){
                                    dataR = {
                                        dataName: gb.getDbName(),
                                        table   : 'te_evaluation_answers',
                                        values : [{
                                            respuesta	: ele.down('customtext').getValue(),
                                            valor		: ele.down('customnumberfield').getValue(),
                                            verdadera	: ele.down('customcheckboxfield').getValue()
                                        },{
                                            id : ele.getAnswerId()
                                        }]
                                    };
                                    socket.emit('updateData',dataR,(err, res)=>{
                                        if(err){
                                            app.showResult('Error al guardar la respuesta.','error');
                                        }
                                    });
                                }else{
                                    dataR = {
                                        dataName: gb.getDbName(),
                                        table   : 'te_evaluation_answers',
                                        values : {
                                            question_id	: quest_id,
                                            respuesta	: ele.down('customtext').getValue(),
                                            valor		: ele.down('customnumberfield').getValue(),
                                            verdadera	: ele.down('customcheckboxfield').getValue(),
                                            estado		: 1
                                        }
                                    };
                                    socket.emit('insertData',dataR,(err, res, id)=>{
                                        if(err){
                                            app.showResult('Error al guardar la respuesta: ' + ele.down('customtext').getValue(),'error');
                                        }else{
                                            ele.setAnswerId(id); // Se guarda el id de la respuesta
                                        }
                                    });
                                }
                            });
                            me.unmask();
                            me.changeCls(2); // Cambia el estado de la pregunata a  guardada
                            app.showResult('Petición realizada correctamente.');
                        }
                    });
                }else{
                    // Crear o guarda una nueva pregunta
                    socket.emit('insertData',dataP,(err, res, id)=>{
                        if(err){
                            app.showResult('Error al guardar la pregunta.','error');
                            me.unmask();
                            socket.close();
                        }else{
                            me.setDataId(id); // Se guarda el id de la pregunta
                            items.forEach(ele => {
                                dataR = {
                                    dataName: gb.getDbName(),
                                    table   : 'te_evaluation_answers',
                                    values : {
                                        question_id	: id,
                                        respuesta	: ele.down('customtext').getValue(),
                                        valor		: ele.down('customnumberfield').getValue(),
                                        verdadera	: ele.down('customcheckboxfield').getValue(),
                                        estado		: 1
                                    }
                                };
                                socket.emit('insertData',dataR,(err, res, idp)=>{
                                    if(err){
                                        app.showResult('Error al guardar la respuesta: ' + ele.down('customtext').getValue(),'error');
                                    }else{
                                        ele.setAnswerId(idp); // Se guarda el id de la respuesta
                                    }
                                });
                            });
                            me.unmask();
                            me.changeCls(2); // Cambia el estado de la pregunata a  guardada
                            me.down('cbtypequestions').setDisabled(true);
                            me.setTypeQuestion(type_question);
                            app.showResult('Petición realizada correctamente.');
                        }
                    });
                }
            }
        }
    }
});
