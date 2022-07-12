/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.view.docentes.ParceladorNewView' ,{
    extend : 'Admin.base.CustomWindow',
    width	  : 600,
    height	  : 580,
    alias 	  : 'widget.ParceladorNewView',
    requires :[
        'Admin.store.docentes.AsigaturasGradoDocenteStore',
        'Admin.combo.CbSedes',
        'Admin.combo.CbModelo',
        'Admin.store.docentes.GradosDocenteStore'
    ],
    typeCli : 0,
    title   : 'Parcelador',
    controller: 'parcelador',
	defaultFocus    : 'CbSedes',
    items: [
        {
            xtype 	        : 'customform',
			defaultFocus    : 'CbSedes',
            items : [
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
                    name            : 'id_grado',
                    fieldLabel      : 'Grado',
                    valueField      : 'id_grado',
                    displayField    : 'grado',
                    itemId          : 'cbGrado',
                    reference       : 'grado',
                    publishes       : 'value',
                    bind            : {
                        visible     : '{comboSedes.value}'
                    },
                    listeners	: {
                        render: function (cb) {
                            if (!Ext.isEmpty(cb.value)) {
                                var
                                    me = Admin.getApplication();
                                extra = {
                                    pdbSede     : cb.up('window').down('#comboSedes').getValue(),
                                    pdbGrado 	: cb.getValue()
                                };
                                me.setParamStore('AsigaturasGradoDocenteStore', extra);
								extra = {
									pdbTable 	: 'periodos_academicos',
									pdbGrado	: cb.getValue(),
									pdbType		: 0
								};
								me.setParamStore('PeriodosStore', extra);
                            }
                        },
                        select: function (combo, record, eOpts) {
                            var
                                me = Admin.getApplication();
                            extra = {
                                pdbSede     : combo.up('window').down('#comboSedes').selection.get('ID'),
                                pdbGrado 	: record.get('id_grado')
                            };
                            me.setParamStore('AsigaturasGradoDocenteStore', extra);

							extra = {
								pdbTable 	: 'periodos_academicos',
								pdbGrado	: record.get('id_grado'),
								pdbType		: 0
							};
							me.setParamStore('PeriodosStore', extra);
                        }
                    }
                },
                {
                    xtype           : 'Combo',
                    store           : 'AsigaturasGradoDocenteStore',
                    name            : 'id_asig',
                    fieldLabel      : 'Asignatura',
                    valueField      : 'id_asig',
                    displayField    : 'asignatura',
                    itemId          : 'cbAsig',
                    reference       : 'asignatura',
                    publishes       : 'value',
                    bind            : {
                        visible     : '{grado.value}'
                    }
                },
                {
                    xtype 		: 'CbPeriodos',
                    labelWidth	: 180,
					bind            : {
						visible     : '{asignatura.value}'
					}
                },
                {
                    xtype 		: 'CbModelo'
                },
                {
                    xtype		: 'DateField',
                    fieldLabel 	: 'Desde',
                    name		: 'fecha_inicio'
                },
                {
                    xtype		: 'DateField',
                    fieldLabel	: 'Hasta',
                    name		: 'fecha_cierre'
                },
                {
                    xtype		: 'customnumberfield',
                    fieldLabel	: 'Nº Clases',
                    name		: 'clases'
                },
                {
                    xtype		: 'customnumberfield',
                    fieldLabel	: 'Tiempo probable (horas):',
                    tooltip		: 'En horas',
                    name		: 'tiempo_probable'
                },
                {
                    xtype		: 'customnumberfield',
                    fieldLabel	: 'Tiempo real (horas):',
                    name		: 'tiempo_real',
                    allowBlank 	: true
                }
            ]
        }
    ]
});
