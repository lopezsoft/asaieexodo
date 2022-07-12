/**
 * Created by LOPEZSOFT on 27/01/2016.
 */
Ext.define('Admin.view.docentes.AusenciasWinView',{
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.AusenciasWinView',
    title   : 'Ausencias',
    controller : 'ausencias',
    requires    : [
        'Admin.store.docentes.CargaAgrupadaStore',
        'Admin.store.docentes.CargaStore',
        'Admin.view.docentes.EstudiantesView',
        'Admin.store.docentes.GradosDocenteStore',
        'Admin.store.docentes.GruposDocenteStore',
        'Admin.store.docentes.AsigaturasDocenteStore'
    ],
    width       : 700,
    height      : 550,
    items   : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype           : 'hiddenfield',
                    name            : 'id_matric',
                    itemId          : 'idMatric'
                },
                {
                    xtype           : 'CbSedes',
                    listeners       : {
                        render : function (cb) {
                            if(!Ext.isEmpty(cb.value)){
                                var
                                    me  = Admin.getApplication();

                                extra = {
                                    pdbSede : cb.value
                                };

                                me.setParamStore('GradosDocenteStore',extra);
                            }
                        },
                        select : function(combo , record , eOpts) {
                            var
                                me  = Admin.getApplication();

                            extra = {
                                pdbSede : record.get('ID')
                            };

                            me.setParamStore('GradosDocenteStore',extra);
                        }
                    }
                },
                {
                    xtype           : 'Combo',
                    store           : 'GradosDocenteStore',
                    name            : 'cod_grado',
                    fieldLabel      : 'Grado',
                    valueField      : 'cod_grado',
                    displayField    : 'grado',
                    itemId          : 'cbGrado',
                    reference       : 'grado',
                    publishes       : 'value',
                    bind            : {
                        visible     : '{comboSedes.value}'
                    },
                    listeners       : {
                        render : function (cb) {
                            if(!Ext.isEmpty(cb.value)){
                                var
                                    me  = Admin.getApplication();
                                extra = {
                                    pdbSede : cb.up('window').down('#comboSedes').value,
                                    pdbGrado: cb.value
                                };

                                me.setParamStore('GruposDocenteStore',extra);
                            }
                        },
                        select : function(combo , record , eOpts) {
                            var
                                me  = Admin.getApplication();

                            extra = {
                                pdbSede : combo.up('window').down('#comboSedes').selection.get('ID'),
                                pdbGrado: record.get('cod_grado')
                            };

                            me.setParamStore('GruposDocenteStore',extra);
                        }
                    }
                },
                {
                    xtype           : 'Combo',
                    store           : 'GruposDocenteStore',
                    name            : 'grupo',
                    fieldLabel      : 'Grupo',
                    valueField      : 'grupo',
                    displayField    : 'grupo',
                    itemId          : 'cbGrupo',
                    reference       : 'grupo',
                    publishes       : 'value',
                    bind            : {
                        visible     : '{grado.value}'
                    },
                    listeners       : {
                        render : function (cb) {
                            if(!Ext.isEmpty(cb.value)){
                                var
                                    me  = Admin.getApplication();
                                extra = {
                                    pdbSede : cb.up('window').down('#comboSedes').value,
                                    pdbGrado: cb.up('window').down('#cbGrado').value,
                                    pdbGrupo: cb.value
                                };

                                me.setParamStore('AsigaturasDocenteStore',extra);
                            }
                        },
                        select : function(combo , record) {
                            var
                                me  = Admin.getApplication();

                            extra = {
                                pdbSede : combo.up('window').down('#comboSedes').selection.get('ID'),
                                pdbGrado: combo.up('window').down('#cbGrado').selection.get('cod_grado'),
                                pdbGrupo: record.get('grupo')
                            };

                            me.setParamStore('AsigaturasDocenteStore',extra);
                        }
                    }
                },
                {
                    xtype           : 'Combo',
                    store           : 'AsigaturasDocenteStore',
                    name            : 'id_asig',
                    fieldLabel      : 'Asignatura',
                    valueField      : 'id_asig',
                    displayField    : 'asignatura',
                    itemId          : 'cbAsig',
                    reference       : 'asignatura',
                    publishes       : 'value',
                    bind            : {
                        visible     : '{grupo.value}'
                    }
                },
                {
                    xtype       : 'fieldcontainer',
                    layout      : 'hbox',
                    bind            : {
                        visible     : '{grupo.value}'
                    },
                    items       : [
                        {
                            xtype       : 'TextField',
                            flex        : 3,
                            fieldLabel  : 'Estudiante',
                            readOnly    : true,
                            name        : 'nombres',
                            itemId      : 'nombres'
                        },
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-upload',
                            text    : 'Importar',
                            itemId  : 'btnLoadStudent',
                            margin  : '0 0 0 2',
                            handler : 'onLoadStudent'
                        }
                    ]
                },
                {
                    xtype       : 'customtextarea',
                    name        : 'motivo',
                    fieldLabel  : 'Motivo de la ausencia'
                },
                {
                    xtype       : 'customtextarea',
                    name        : 'observacion',
                    fieldLabel  : 'Observación'
                },
                {
                    xtype       : 'customradiogroup',
                    fieldLabel  : 'Tipo',
                    defaults    : {
                        name    : 'tipo'
                    },
                    items       : [
                        {
                            boxLabel    : 'Justificada',
                            inputValue  : '1'
                        },
                        {
                            boxLabel    : 'Injustificada',
                            inputValue  : '2'
                        },
                        {
                            boxLabel    : 'Retraso',
                            inputValue  : '3'
                        }
                    ],
                    listeners   : {
                        change : function(rg, newValue, oldValue, eOpts ){
                            win = rg.up('window');

                            if (newValue.tipo === '3') {
                               value    = false;
                            }else{
                                value    = true;
                            }

                            win.down('#horas').setHidden(value);
                            win.down('#horas').allowBlank = value;
                        }
                    }
                },
                {
                    xtype       : 'customnumberfield',
                    name        : 'horas',
                    fieldLabel  : 'Horas',
                    hidden      : true,
                    allowBlank  : true,
                    itemId      : 'horas'
                },
                {
                    xtype       : 'DateField',
                    name        : 'fecha_falta',
                    fieldLabel  : 'Fecha ausencia'
                }
            ]
        }
    ]
});