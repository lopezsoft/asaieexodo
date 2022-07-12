/**
 * Created by LOPEZSOFT on 14/12/2015.
 */
Ext.define('Admin.view.docentes.PlanSemanalNewView', {
    extend: 'Admin.base.WindowCrud',
    alias : 'widget.PlanSemanalNewView',
    height: 550,
    controller : 'parcelador',
    items: [
        {
            xtype : 'customform',
            defaultType     :'customtextarea',
            items : [
                {
                    xtype 		: 'CbGrados',
                    reference   : 'grados',
                    publishes   : 'value',
                    itemId      : 'grados',
                    listeners	: {
                        select 	: function(combo, records, eOpts) {
                            var cSME	= Admin.getApplication(),
                                ExParams = null;

                            ExExParams = {
                                pdbCodGrado : records.get('COD_GRADO')
                            };

                            cSME.setParamStore('AsignaturasStore',ExExParams,true);
                        },

                        afterrender :function(cbo, eOpts ) {
                            var
                                cSME	= Admin.getApplication(),
                                ExParams = null;

                            ExExParams = {
                                pdbCodGrado : cbo.getValue()
                            };

                            cSME.setParamStore('AsignaturasStore',ExExParams,true);
                        }
                    }
                },
                {
                    xtype 		: 'CbAsignaturas',
                    name		: 'id_asig',
                    displayField: 'asignatura',
                    valueField	: 'cod_asig',
                    bind        : {
                        visible : '{grados.value}'
                    }
                },
                {
                    xtype 		: 'CbPeriodos',
                    labelWidth	: 180
                },
                {
                    fieldLabel  : 'Temas',
                    name        : 'temas'
                },
                {
                    fieldLabel  : 'Indicadores',
                    name        : 'indicadores'
                },
                {
                    fieldLabel  : 'Actividades',
                    name        : 'actividades'
                },
                {
                    xtype 		: 'CbSedes'
                },
                {
                    xtype		: 'DateField',
                    fieldLabel 	: 'Desde',
                    name		: 'fecha_inicio'
                },
                {
                    xtype		: 'DateField',
                    fieldLabel	: 'Hasta',
                    name		: 'fecha_final'
                }
            ]
        }
    ]
});