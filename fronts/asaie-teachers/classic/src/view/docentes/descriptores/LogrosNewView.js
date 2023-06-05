/**
 * Created by LOPEZSOFT on 30/12/2015.
 */
Ext.define('Admin.view.docentes.LogrosNewView',{
    extend: 'Admin.base.WindowCrud',
    title		: 'Logros de desempeño',
    alias 		: 'widget.LogrosNewView',
    controller  : 'logros',
    maximized   : true,
    defaultFocus: 'customtextarea',
    items : [
        {
            xtype 			: 'customform',
            fieldDefaults   : {
                labelAlign	: 'top',
                labelStyle	: 'font-weight:bold'
            },
            defaultType : 'customtextarea',
            defaultFocus    : 'customtextarea',
            items : [
                {
                    xtype		: 'customradiogroup',
                    fieldLabel	: 'Estado',
                    itemId		: 'estado',
                    defaults	: {
                        name	: 'estado'
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
                    itemId		: 'id_logro',
                    listeners	: {
                        change : function (txtA, newValue, oldValue, eOpts ) {
                            var win		= txtA.up('window'),
                                cValue 	= win.down('#estado').getValue(),
                                form	= win.down('form');
                            if (!form.getRecord()) { // Si se está realizando una nueva inserción de datos.
                                if (cValue.estado == '1') {
                                    var
                                        bajoValue   = globales.General.bajoValue + globales.General.getFirstLowerCase(newValue),
                                        basicoValue = globales.General.basicoValue + globales.General.getFirstLowerCase(newValue),
                                        altoValue   = globales.General.altoValue + globales.General.getFirstLowerCase(newValue);

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
                    xtype 		: 'Combo',
                    fieldLabel	: 'Desempeño:',
                    queryMode	: 'remote',
                    name		: 'id_desempeño',
                    displayField: 'desempeno',
                    valueField	: 'id',
                    itemId		: 'desempen',
                    store		: 'DesempenosStore',
                    allowBlank	: true,
                    hidden		: true,
                    autoLoadOnValue : true
                },
                {
                    xtype 		: 'CbPeriodos'
                }
            ]
        }
    ]
});
