Ext.define('Admin.view.docs.ResponseEvaluation',{
    extend          : 'Admin.base.CustomWindow',
    alias           : 'widget.responseevaluation',
    closable        : false,
    iconCls			: '',
    constrainHeader	: false,
    fixed           : true,
    hideShadowOnDeactivate : false,
    animateShadow   : true,
    border          : false,
    resizable       : true,
    bodyBorder      : false,
    cls             : 'menu-win',
    maximizable     : false,
    header          : false,
    task            : true,
    config          : {
        intentos        : 0,
        minutos         : 0,
        segundos        : 0,
        hora            : null,
        questions       : 0,
        questionRecords : null,
        record          : null
    },
    defaultListenerScope : true,
    app         : null,
    constructor : function (config) {
        var me  = this;
        me.app  = Admin.getApplication();
        Ext.apply(me.config, config);
        this.callParent(arguments);
        me.on('cancel',function (me) {

        });
        return me;
    },

    initComponent   : function(){
        let me  = this;
        me.callParent();
        me.runClock( parseInt(me.getRecord().get('tiempo')));
    },
    changerequest : function (id) {
        let me      = this,
            comp    = me.down('containerquestions'),
            ncount  = 0;
        comp.items.items.forEach(ele => {
            if (ele.xtype == 'form') {
                if(ele.isValid()){
                    ncount++;
                }
            }
        });
        me.down('#saveButton').setDisabled((ncount == parseInt(me.questions)) ? false : true);
        me.down('#requestButton').setHtml('Preguntas con respuesta '+ ncount +'/' + me.questions + ' ');
     },
    savechanges : function () {
        let me          = this,
            comp        = me.down('containerquestions'),
            app         = Admin.getApplication(),
            ncount      = 0, 
            record      = null,
            data        = {},
            maxPoints   = 0,
            points      = 0,
            nverdaderas = 0,
            nfalsas     = 0,
            nsuma       = 0,
            answerSum   = 0,
            indCorrect  = 0,
            indFalsas   = 0,
            nabiertas   = 0,
            type        = 0;
        sql = 'SELECT MAX(td.hasta) AS points FROM desempeños AS td  '+
              'LEFT JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id '+
              'LEFT JOIN aux_grados_agrupados AS t3  ON t3.id_grado_agrupado = t1.id '+
              'LEFT JOIN escala_nacional AS t2 ON td.id_escala = t2.id '+
              'WHERE td.year= '+ Global.getYear() +' AND t3.id_grado = ' + me.getRecord().get('id_grade');
        socket  = Global.getSocket();
        socket.emit('sqlQuery',{
            dataName    : Global.getDbName(),
            sql         : sql
        },(err, res) =>{
            if(err){
                app.showResult('No es posible realizar la acción de guardado.','error');
                return;
            }
            maxPoints   = parseFloat(res[0].points);
            points      = parseFloat((maxPoints / parseInt(me.questions)).toFixed(2));
            comp.items.items.forEach(ele => {
                if (ele.xtype == 'form') {
                    if(ele.isValid()){
                        child   = ele.down('fieldcontainerquestions').down('fieldset').items.items[0];
                        record  = ele.down('fieldcontainerquestions').getRecord();
                        type    = parseInt(record.type_id);
                        switch (type) {
                            /*General o abierta*/
                            case 1 :
                                data    = {
                                    shared_evaluation_id    : me.getRecord().get('id'),
                                    question_id             : record.id,
                                    answer_id               : child.answerId,
                                    intento                 : me.intentos,
                                    respuesta_abierta       : child.getValue(),
                                    valor                   : 0,
                                    calificada              : 0,
                                    correcta                : 0
                                };
                                let xsocket  = Global.getSocket();
                                xsocket.emit('insertData',{
                                    dataName: Global.getDbName(),
                                    table   : 'te_evaluation_response_history',
                                    values  : data
                                },(err, res)=>{
                                    xsocket.close();
                                });
                                nsuma   += parseFloat(points);
                                nabiertas ++;
                                break;           
                            /*FALSO/VERDADERO*/ /*Selección múltiple con única respuesta*/  /*Selección múltiple con múltiple respuesta*/
                            default:
                                ncount      = 0;
                                answerSum   = 0;
                                indCorrect  = 0;
                                indFalsas   = 0;
                                child.items.items.forEach(ele => {
                                    if(ele.checked){
                                        data    = {
                                            shared_evaluation_id    : me.getRecord().get('id'),
                                            question_id             : record.id,
                                            answer_id               : ele.answerId,
                                            intento                 : me.intentos,
                                            respuesta_abierta       : '',
                                            valor                   : ele.inputValue,
                                            calificada              : 1,
                                            correcta                : ele.correct
                                        };
                                        answerSum   += parseFloat((points * parseFloat(ele.inputValue) /100).toFixed(2));
                                        if (ele.correct == 1) {
                                            nverdaderas ++;
                                            indCorrect ++;
                                        }else {
                                            nfalsas ++;
                                            indFalsas ++;
                                        }
                                        let xsocket  = Global.getSocket();
                                        xsocket.emit('insertData',{
                                            dataName: Global.getDbName(),
                                            table   : 'te_evaluation_response_history',
                                            values  : data
                                        },(err, res)=>{
                                            xsocket.close();
                                        });
                                        ncount ++;
                                    }
                                });
                                // Cuando la pregunta es de selección multiple con multiple respuesta y a marcado respuestas verdaderas y falsas
                                if(indFalsas > 0 && indCorrect > 0){
                                    answerSum   = parseFloat((answerSum / ncount).toFixed(2));
                                    nsuma       += parseFloat(answerSum * indCorrect);
                                }else{
                                    nsuma       += parseFloat(answerSum);
                                }
                                break;
                        }
                    }
                }
            });
            let zsocket  = Global.getSocket();
            zsocket.emit('insertData',{
                dataName: Global.getDbName(),
                table   : 'te_evaluation_result',
                values  : {
                    shared_evaluation_id: me.getRecord().get('id'),
                    hora_inicio         : me.getHora(),
                    res_verdaderas      : nverdaderas,
                    res_falsas          : nfalsas,
                    res_abiertas        : nabiertas,
                    tiempo              : me.minutos,
                    segundos            : me.segundos,
                    intento             : me.intentos,
                    punataje            : nsuma
                }
            },(err, res) => {
                if(err){
                    console.log(err);
                    app.showResult('Error al guardar el resultado de la evaluación.');
                    return;
                }
                me.stopClock();
                Ext.create('Admin.view.docs.VideoView',{
                    maxHeight      : 250,
                    maxWidth       : 360,
                    items   :[
                        {
                            xtype   : 'form',
                            ui      : 'panel-white',
                            items   : [
                                {
                                    xtype   : 'container',
                                    cls     : 'widget-bottom-first-container postion-class',
                                    height  : 220,
                                    padding : '30 0 0 0',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center'
                                    },
                                    items: [
                                        {
                                            xtype   : 'label',
                                            cls     : 'widget-name-text',
                                            html    : 'Respuestas correctas: '+nverdaderas.toString()
                                        },
                                        {
                                            xtype   : 'label',
                                            cls     : 'widget-name-text',
                                            html    : 'Respuestas incorrectas: '+nfalsas.toString()
                                        },
                                        {
                                            xtype   : 'label',
                                            cls     : 'widget-name-text',
                                            html    : 'Respuestas abiertas y sin calificar: '+nabiertas.toString()
                                        },
                                        {
                                            xtype   : 'label',
                                            cls     : 'widget-name-text',
                                            html    : 'Intento: '+me.intentos.toString()
                                        },
                                        {
                                            xtype   : 'label',
                                            cls     : 'widget-name-text',
                                            html    : 'Tiempo de respuesta: '+("0" + me.minutos.toString()).slice (-2)+' MIN.'+
                                                ' con '+("0" + me.segundos.toString()).slice (-2)+' SEG.'
                                        },
                                        {
                                            xtype   : 'label',
                                            cls     : 'widget-name-text',
                                            html    : 'Nota obtenida: '+nsuma.toString()
                                        }
                                    ]
                                }
                            ]
                        }
                     ]
                }).show();
                me.close();
            });
        });
        // TODO : Pendiente por organizar registro automático de la nota obtenida
        // socket  = gb.getSocket();
        // socket.emit('sql-query-call',{
        //     cCall   : 'sp_evaluacion_estudiantes_update_nota',
        //     cParam  : r.get('id')
        // });
    },
    runClock : function (val) {
        var
            me      = this,
            clock   = me.down('#clockButton'),
            next    = 0,
            count   = 0,
            text    = 60,
            fin     = false,
            min     = val - 1;
            me.task	= Ext.TaskManager.start({
                run	: function () {
                    next	++;
                    count = text - next;
                    clock.setHtml(("Tiempo restante: 0" + min.toString()).slice (-2)+':'+("0" + count.toString()).slice (-2)+' ');
                    me.segundos ++;
                    if(next == 60) {
                        min --;
                        count	= 0;
                        next	= 0;
                        me.minutos  ++;
                        me.segundos = 0;
                        if (fin){
                            me.app.showResult('Lamentablemente se ha agotado el tiempo para responder la evaluación!');
                            me.savechanges();
                            me.stopClock();
                        }
                    }
                    if (min == 0) {
                        fin = true
                    };
                },
                interval	: 1000
            });

    },
    stopClock   : function () {
        var
            me  = this;
        Ext.TaskManager.stop(me.task);
    },

    onNextClick: function(button) {
        let panel   = button.up('panel'),
            layout  = panel.getLayout(),
            app     = Admin.getApplication(),
            activeItem;
        activeItem = layout.getActiveItem();

        if(activeItem.xtype == 'form'){
            if(activeItem.isValid()){
                panel.getViewModel().set('atBeginning', false);
                this.navigate(button, panel, 'next');
            }else{
                app.showResult('Llene las respuestas de la pregunta para continuar.','error');
            }
        }else{
            panel.getViewModel().set('atBeginning', false);
            this.navigate(button, panel, 'next');
        }
    },

    onPreviousClick: function(button) {
        let panel   = button.up('panel'),
            layout  = panel.getLayout(),
            app     = Admin.getApplication(),
            activeItem;
        activeItem = layout.getActiveItem();

        if(activeItem.xtype == 'form'){
            if(activeItem.isValid()){
                panel.getViewModel().set('atEnd', false);
                this.navigate(button, panel, 'prev');
            }else{
                app.showResult('Llene las respuestas de la pregunta para continuar.','error');
            }
        }else{
            panel.getViewModel().set('atEnd', false);
            this.navigate(button, panel, 'prev');
        }
    },

    navigate: function(button, panel, direction) {
        var layout          = panel.getLayout(),
            progress        = panel.down('#progress'),
            model           = panel.getViewModel(),
            progressItems   = progress.items.items,
            item, i, activeItem, activeIndex;

        layout[direction]();
        activeItem = layout.getActiveItem();
        activeIndex = panel.items.indexOf(activeItem);

        for (i = 0; i < progressItems.length; i++) {
            item = progressItems[i];
            if (activeIndex === item.step) {
                item.setPressed(true);
            }
            else {
                item.setPressed(false);
            }
            
            // IE8 has an odd bug with handling font icons in pseudo elements;
            // it will render the icon once and not update it when something
            // like text color is changed via style addition or removal.
            // We have to force icon repaint by adding a style with forced empty
            // pseudo element content, (x-sync-repaint) and removing it back to work
            // around this issue.
            // See this: https://github.com/FortAwesome/Font-Awesome/issues/954
            // and this: https://github.com/twbs/bootstrap/issues/13863
            if (Ext.isIE8) {
                item.btnIconEl.syncRepaint();
            }
        }

        activeItem.focus();

        // beginning disables previous
        if (activeIndex === 0) {
            model.set('atBeginning', true);
        }
        
        // wizard is 4 steps. Disable next at end.
        if (activeIndex === progressItems.length - 1) {
            model.set('atEnd', true);
        }
    }
});
