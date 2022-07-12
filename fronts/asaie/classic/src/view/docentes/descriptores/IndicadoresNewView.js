/**
 * Created by LOPEZSOFT on 31/12/2015.
 */
Ext.define('Admin.view.docentes.IndicadoresNewView',{
    extend: 'Admin.base.WindowCrud',
    title		: 'Indicadores de desempeño',
    alias 		: 'widget.IndicadoresNewView',
    controller  : 'logros',
    maximized   : true,
    defaultFocus: 'textareafield',
    items : [
        {
            xtype 			: 'customform',
            fieldDefaults: {
                labelAlign	: 'top',
                labelStyle	: 'font-weight:bold'
            },
            defaultType : 'textareafield',
            defaultFocus    : 'textareafield',
            items : [
                {
                    xtype	: 'customradiogroup',
                    columns	: 3,
                    fieldLabel: 'Tipo',
                    defaults	: {
                        name	: 'tipo'
                    },
                    items: [
                        {
                            boxLabel	: 'Indicador',
                            inputValue	: '3' ,
                            itemId		: 'Indicador'
                        },
                        {
                            boxLabel	: 'Fortaleza',
                            inputValue	: '4',
                            itemId		: 'Fortaleza'
                        },
                        {
                            boxLabel	: 'Dificultad',
                            inputValue	: '5',
                            itemId		: 'Dificultad'
                        }
                    ],
                    listeners : {
                        afterrender : function (rdBtn, eOpts) {
                            var proc = globales.General.DbConfig.procesos,
                                Btn  = rdBtn;
                            switch(proc){
                                case '3': // Competenciias y estandares de competencia
                                    Btn.down('#Indicador').setVisible(true);
                                    Btn.down('#Fortaleza').setVisible(false);
                                    Btn.down('#Dificultad').setVisible(false);
                                    Btn.down('#Indicador').setRawValue(true);
                                    Btn.down('#Indicador').setBoxLabel('Indicador');
                                    break;
                                case '4' : // Fortalezas y dificultades
                                    Btn.down('#Indicador').setVisible(false);
                                    Btn.down('#Fortaleza').setVisible(true);
                                    Btn.down('#Dificultad').setVisible(true);
                                    if (!Btn.down('#Dificultad').getValue() && !Btn.down('#Fortaleza').getValue()){
                                        Btn.down('#Fortaleza').setRawValue(true);
                                    }

                                    break;
                                default: // Indicadores de logros
                                    Btn.down('#Indicador').setVisible(true);
                                    Btn.down('#Fortaleza').setVisible(false);
                                    Btn.down('#Dificultad').setVisible(false);
                                    Btn.down('#Indicador').setRawValue(true);
                                    break;
                            }
                        }

                    }
                },
                {
                    xtype		: 'customradiogroup',
                    itemId		: 'estado',
                    fieldLabel	: 'Estado',
                    defaults	: {
                        name	  	: 'estado'
                    },
                    items: [
                        {
                            boxLabel	: 'Asignar a los estudiantes, según desempeño',
                            inputValue	: '1'
                        },
                        {
                            boxLabel	: 'Asignar a los estudiantes, sin tener en cuenta el desempeño',
                            inputValue	: '2'
                        },
                        {
                            boxLabel	: 'No asignar automáticamente a los estudiantes',
                            inputValue	: '3'
                        }
                    ],
                    listeners : {
                        change : function (radiogroup, newValue, oldValue, eOpts) {
                            var win 	= radiogroup.up('window'),
                                form	= win.down('form');
                            if (newValue.estado == 1){
                                if (form.getRecord()){
                                    combo	= win.down('#desempen');
                                    combo.setVisible(true);
                                    combo.allowBlank = false;
                                }else {
                                    win.down('#bajo').setVisible(true);
                                    win.down('#basico').setVisible(true);
                                    win.down('#alto').setVisible(true);
                                    win.down('#bajo').allowBlank = false;
                                    win.down('#basico').allowBlank = false;
                                    win.down('#alto').allowBlank = false;
                                }
                            }else{
                                if (form.getRecord()){
                                    combo	= win.down('#desempen');
                                    combo.setVisible(false);
                                    combo.allowBlank = true;
                                }else {
                                    win.down('#bajo').setVisible(false);
                                    win.down('#basico').setVisible(false);
                                    win.down('#alto').setVisible(false);
                                    win.down('#bajo').allowBlank = true;
                                    win.down('#basico').allowBlank = true;
                                    win.down('#alto').allowBlank = true;
                                }
                            }
                        }
                    }
                },
                {
                    xtype       : 'TextField',
                    name        : 'consecutivo',
                    fieldLabel  : 'Código',
                    itemId      : 'codigo',
                    allowBlank  : true,
                    hidden      : true
                },
                {
                    name      	: 'descripcion',
                    fieldLabel	: 'Descripción',
                    itemId		: 'indicador',
                    listeners	: {
                        change : function (txtA, newValue, oldValue, eOpts ) {
                            var win		= txtA.up('window'),
                                cValue 	= win.down('#estado').getValue(),
                                form	= win.down('form');
                            if (!form.getRecord()) { // Si se está realizando una nueva inserción de datos.
                                if (cValue.estado == '1') {
                                    var
                                        bajoValue = globales.General.bajoValue + globales.General.getFirstLowerCase(newValue),
                                        basicoValue = globales.General.basicoValue + globales.General.getFirstLowerCase(newValue),
                                        altoValue = globales.General.altoValue + globales.General.getFirstLowerCase(newValue);

                                    win.down('#bajo').setValue(bajoValue);
                                    win.down('#basico').setValue(basicoValue);
                                    win.down('#alto').setValue(altoValue);
                                }
                            }
                        }
                    }
                },
                {
                    fieldLabel	: 'Desempeño Bajo',
                    name		: 'bajo',
                    itemId		: 'bajo',
                    hidden      : true,
                    allowBlank	: true
                },
                {
                    fieldLabel	: 'Desempeño Básico',
                    name		: 'basico',
                    itemId		: 'basico',
                    hidden      : true,
                    allowBlank	: true
                },
                {
                    fieldLabel	: 'Desempeño Alto',
                    name		: 'alto',
                    itemId		: 'alto',
                    hidden      : true,
                    allowBlank	: true
                },
                {
                    xtype 		: 'combo',
                    fieldLabel	: 'Desempeño:',
                    queryMode	: 'remote',
                    name		: 'id_desempeño',
                    displayField: 'desempeno',
                    valueField	: 'id',
                    itemId		: 'desempen',
                    store		: 'DesempenosStore',
                    allowBlank	: true,
                    hidden		: true,
                    autoLoadOnValue: true
                },
                {
                    xtype 		: 'CbPeriodos'
                },
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Competencia',
                    store       : 'CompetenciasStore',
                    name		: 'id_competencia',
                    displayField: 'competencia',
                    valueField	: 'id',
                    itemId		: 'comboCompetencias'
                }
            ]
        }
    ]
});
