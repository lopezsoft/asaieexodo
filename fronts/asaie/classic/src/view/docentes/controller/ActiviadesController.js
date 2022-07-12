Ext.define('Admin.view.docentes.controller.ActiviadesController', {
    extend: 'Admin.base.BaseController',
    alias: 'controller.actividades',
    init: function() {
        this.setConfigVar();
    },

    onLiveClasses: function(btn) {
        this.redirectTo('teacherliveclasses', true);
    },

    viewActivitiesStudents: function(btn) {
        let
            panel = btn.up('panel'),
            record = panel.getRecord(),
            view = Admin.getApplication().getMainView();
        if (view) {
            cont = view.getController();
            cont.onRemove('studentsonlineactivities');
            newView = Ext.create({
                xtype: 'studentsonlineactivities',
                routeId: 'studentsonlineactivities',
                activityId: panel.getActivityId(),
                courseId: record.get('course_id'),
                activityName: panel.getActivityName() + ': ' + record.get('grado') + ' - ' + record.get('grupo'),
                hideMode: 'offsets'
            });
            cont.setChangeCurrentView('studentsonlineactivities', newView);
        }
    },
    viewActivitiesCourses: function(grid, rowIndex) {
        let
            record = grid.getStore().getAt(rowIndex);
        view = Admin.getApplication().getMainView();
        if (view) {
            cont = view.getController();
            cont.onRemove('activitiescourses');
            newView = Ext.create({
                xtype: 'activitiescourses',
                routeId: 'activitiescourses',
                activityId: record.get('id'),
                activityName: record.get('nombre'),
                hideMode: 'offsets'
            });
            cont.setChangeCurrentView('activitiescourses', newView);
        }
    },

    /**
     * Cursos de las evaluaciones
     */
    onViewCourses: function() {
        this.redirectTo('evaluationcourses', true);
    },
    viewCourses: function(grid, rowIndex) {
        let
            record = grid.getStore().getAt(rowIndex);
        view = Admin.getApplication().getMainView();
        if (view) {
            cont = view.getController();
            cont.onRemove('evaluationcourses');
            newView = Ext.create({
                xtype: 'evaluationcourses',
                routeId: 'evaluationcourses',
                evaluationId: record.get('id'),
                evaluationName: record.get('nombre'),
                hideMode: 'offsets'
            });
            cont.setChangeCurrentView('evaluationcourses', newView);
        }
    },
    /**
     * Resultados de las evaluaciones
     */
    viewResults: function(btn) {
        let
            panel = btn.up('panel'),
            record = panel.getRecord(),
            view = Admin.getApplication().getMainView();
        if (view) {
            cont = view.getController();
            cont.onRemove('evaluationresult');
            newView = Ext.create({
                xtype: 'evaluationresult',
                routeId: 'evaluationresult',
                evaluationId: panel.getEvaluationId(),
                courseId: record.get('course_id'),
                evaluationName: panel.getEvaluationName() + ': ' + record.get('grado') + ' - ' + record.get('grupo'),
                hideMode: 'offsets'
            });
            cont.setChangeCurrentView('evaluationresult', newView);
        }
    },
    /**
     * Estudiantes de las evaluaciones
     */
    viewStudents: function(btn) {
        let
            panel = btn.up('panel'),
            record = panel.getRecord(),
            view = Admin.getApplication().getMainView();
        if (view) {
            cont = view.getController();
            cont.onRemove('studentsbyevaluationcourses');
            newView = Ext.create({
                xtype: 'studentsbyevaluationcourses',
                routeId: 'studentsbyevaluationcourses',
                evaluationId: panel.getEvaluationId(),
                courseId: record.get('course_id'),
                evaluationName: panel.getEvaluationName() + ': ' + record.get('grado') + ' - ' + record.get('grupo'),
                hideMode: 'offsets'
            });
            cont.setChangeCurrentView('studentsbyevaluationcourses', newView);
        }
    },
    onViewEval: function(grid, rowIndex) {
        var
            rec = grid.getStore().getAt(rowIndex);
        grid.setSelection(rec);
    },
    onPublicarView: function(grid, rowIndex) {
        var me = this.app,
            rec = grid.getStore().getAt(rowIndex),
            gb = Global,
            data = {
                dataName: gb.getDbName(),
                fields: 'count(*) total',
                table: 'te_evaluation_questions',
                where: 'evaluation_id = ? ',
                values: [rec.get('id')]
            },
            cfg = gb.getCfg();
        grid.setSelection(rec);
        if (rec.get('publicada')) {
            me.showResult('Ya fue publicada esta evaluación.');
        } else {
            Ext.Msg.show({
                title: 'Publicar evaluación',
                message: 'Desea publicar la evaluación?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        socket = gb.getSocket();
                        socket.emit('querySelect', data, function(err, data) {
                            if (err) return;
                            if (data.length > 0) {
                                val = rec.get('num_preguntas') - data[0].total;
                                if (val == 0) {
                                    rec.set('publicada', true);
                                    grid.getStore().sync({
                                        success: function(resp) {
                                            me.showResult('Se ha publicado la evaluación correctamente.');
                                            socket.emit('sendEvaluation', {
                                                id: rec.get('id'),
                                                cnf: cfg
                                            }, function() {
                                                socket.close();
                                            });
                                        }
                                    })
                                } else {
                                    me.showResult('Primero debe completar el número de preguntas.', 'error');
                                }
                            }
                        });
                    }
                }
            });
        }
    },

    onViewRespuestas: function(btn) {
        var
            me = this.app,
            record = btn.up('form').down('grid').getSelection()[0];
        e = {
            pdbTable: 'te_evaluation_questions',
            where: '{"evaluation_id": ' + record.get('id') + '}'
        };
        me.setParamStore('EvaluationQuestionsStore', e, false);
        title = 'Preguntas - ' + record.get('nombre') + ' - ' + Global.getYear();
        Ext.create('Admin.view.docentes.EvaluationQuestions', {
            title: title
        }).show();
    },

    onCreatePreguntas: function(btn) {
        let
            form = btn.up('form'),
            record = form.down('grid').getSelection()[0],
            items = [],
            numQuest = parseInt(record.get('num_preguntas'));
        view = Admin.getApplication().getMainView();
        if (view) {
            data = {
                fields: 'count(*) total',
                dataName: Global.getDbName(),
                table: 'te_evaluation_questions',
                where: 'evaluation_id = ? ',
                values: [record.get('id')]
            };
            socket = Global.getSocket();
            socket.emit('querySelect', data, function(err, res) {
                if (err) {
                    Admin.getApplication().onError(err.sqlMessage);
                    return
                };
                if (res.length > 0) {
                    val = numQuest - res[0].total;
                    if (val > 0) {
                        numQuest = val;
                        form.mask();
                        cont = view.getController();
                        cont.onRemove('evaluationcreate');
                        items.push({
                            height: 230,
                            cls: 'kpi-meta-charts',
                            userCls: 'small-100 big-100',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [{
                                xtype: 'panel',
                                bodyCls: 'statistics-body shadow',
                                flex: 1,
                                title: 'REGISTRO DE PREGUNTAS A LA EVALUACIÓN:',
                                tpl: [
                                    '<div class="statistic-header">' + record.get('nombre') + 's</div>',
                                    '<tpl for=".">',
                                    '<div class="statistic-description">{description}</div>',
                                    '<div class="sparkline">',
                                    '<div class="sparkline-inner sparkline-inner-{status}" style="width: {[values.ratio * 100]}%;"></div>',
                                    '</div>',
                                    '</tpl>'
                                ],
                                data: [{
                                    status: 'active',
                                    description: record.get('descripcion'),
                                    ratio: 1
                                }, {
                                    status: 'ended',
                                    description: record.get('tiempo') + ' minutos',
                                    ratio: 1
                                }, {
                                    status: 'paused',
                                    description: record.get('num_preguntas') + ' preguntas',
                                    ratio: 1
                                }]
                            }]
                        });
                        for (let index = 1; index <= numQuest; index++) {
                            items.push({
                                cls: 'kpi-meta-charts',
                                xtype: 'evaluationpanel',
                                info: 'Pregunta ' + (index).toString() + ' de ' + numQuest,
                                questionId: index
                            });
                        }
                        newView = Ext.create({
                            xtype: 'evaluationcreate',
                            routeId: 'evaluationcreate',
                            totalQuestions: numQuest,
                            record: record,
                            newItems: items,
                            hideMode: 'offsets'
                        });
                        form.unmask();
                        cont.setChangeCurrentView('evaluationcreate', newView);
                    } else {
                        me.showResult('No hay preguntas faltantes.');
                    }
                }
                socket.close();
            });
        }
    },

    onEvaluaciones: function(btn) {
        this.redirectTo('evaluaciones', true);
    },

    onSaveActividades: function(btn) {
        var win = btn.up('window'),
            me = this,
            form = win.down('form'),
            record = form.getRecord(),
            values = form.getValues(),
            store = Ext.getStore('ActividadesClaseStore'),
            param = me.app.getParamStore('ActividadesClaseStore');

        data = {
            actividad: values.actividad,
            fecha: values.fecha,
            id_curso: param.pdbCurso
        };

        me.onDataSave(record, values, store, data, win, true);
    },

    onViewActividadesSave: function(btn) {
        var
            me = this.app;
        me.onMsgWait();
        Ext.onReady(function() {
            win = me.getWindow('Nuevo/Editar Actividades académicas ' + SME.ConfigApp.year, 'Admin.view.docentes.ActividadesClaseSaveView');
            if (btn.itemId == 'btnEdit') {
                record = btn.up('window').down('grid').getSelection()[0];
                form = win.down('form');
                form.loadRecord(record);
            }
            me.onMsgClose();
            win.show();
        })
    },

    onViewAusencias: function(btn) {
        var
            me = this.app;
        Ext.onReady(function() {
            me.onStore('docentes.AusenciasStore');
            me.onStore('docentes.CargaAgrupadaStore');
            me.onStore('docentes.CargaStore');
            me.onStore('docentes.EstudiantesStore');
            me.onStore('general.SedesStore');
            me.onStore('docentes.GradosDocenteStore');
            me.onStore('docentes.GruposDocenteStore');
            me.onStore('docentes.AsigaturasDocenteStore');
            win = me.getWindow('Ficha Registro y control de Ausencias', 'Admin.view.docentes.AusenciasView');
            me.onMsgClose();
            win.show();
        });
    },

    onViewActividadesCrud: function(btn) {
        var
            me = this.app;
        Ext.onReady(function() {
            record = btn.up('window').down('grid').getSelection()[0];
            param = {
                pdbTable: 'reg_actividades',
                pdbCurso: record.get('id')
            };
            me.onStore('docentes.ActividadesClaseStore');
            me.setParamStore('ActividadesClaseStore', param, false);
            win = me.getWindow('Actividades académicas - ' + record.get('asignatura') + ' - ' + record.get('grado') + ' - ' + record.get('grupo') + ' - ' + SME.ConfigApp.year, 'Admin.view.docentes.ActividadesClaseView');
            me.onMsgClose();
            win.show();
        })
    },

    onActividadesView: function(btn) {
        this.redirectTo('onlineactities', true);
    },
    onDocument: function(grid, rowIndex, colIndex) {
        var rec = grid.getStore().getAt(rowIndex);
        if (Ext.isEmpty(rec.get('url_archivo'))) {
            this.app.showResult('No hay documento adjunto');
        } else {
            this.onViewDocument(rec.get('url_archivo'), rec.get('mime'));
        }
    },
    onVideo: function(grid, rowIndex, colIndex) {
        var rec = grid.getStore().getAt(rowIndex);
        if (Ext.isEmpty(rec.get('url_video'))) {
            this.app.showResult('No hay video adjunto');
        } else {
            this.onViewVideo(rec.get('url_video'));
        }
    },
    onUrl: function(grid, rowIndex, colIndex) {
        var rec = grid.getStore().getAt(rowIndex);
        if (Ext.isEmpty(rec.get('url_enlace'))) {
            this.app.showResult('No hay enlace adjunto');
        } else {
            this.onViewUrl(rec.get('url_enlace'));
        }
    }

});