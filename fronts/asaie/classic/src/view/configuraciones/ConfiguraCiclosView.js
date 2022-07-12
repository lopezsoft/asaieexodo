/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.ConfiguraCiclosView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Configuración ciclos',
    controller  : 'configuraciones',
    alias       : 'widget.ConfiguraCiclosView',
    height	    : 550,
    items       : [
        {
            xtype   : 'customform',
            items: [
                {
                    xtype   : 'customcheckboxfield',
                    name    : 'ultimo_per_define',
                    boxLabel: 'Último periodo define la promoción del estudiante'
                },
                {
                    xtype   : 'fieldSet',
                    title   : 'Trabajar año  lectivo por:',
                    items   : [
                        {
                            xtype   : 'customradiogroup',
                            items   : [
                                {
                                    boxLabel    : 'Áreas',
                                    name        : 'ar_ciclos',
                                    inputValue  : 1
                                },
                                {
                                    boxLabel    : 'Asignaturas',
                                    name        : 'ar_ciclos',
                                    inputValue  : 2
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype   : 'fieldSet',
                    title   : 'Pierden directamente con:',
                    items   : [
                        {
                            xtype   : 'customradiogroup',
                            vertical: false,
                            items   : [
                                {
                                    boxLabel    : '1 o más',
                                    name        : 'ar_per_ciclos',
                                    inputValue  : 1
                                },
                                {
                                    boxLabel    : '2 o más',
                                    name        : 'ar_per_ciclos',
                                    inputValue  : 2
                                },
                                {
                                    boxLabel    : '3 o más',
                                    name        : 'ar_per_ciclos',
                                    inputValue  : 3
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype   : 'fieldSet',
                    title   : 'Luego de las estrategias de apoyo, pierden año lectivo los estudiantes que persistan en perdida de:',
                    items   : [
                        {
                            xtype   : 'customradiogroup',
                            items   : [
                                {
                                    boxLabel    : '1 De las recuperaciones',
                                    name        : 'per_rec_ciclos',
                                    inputValue  : 1
                                },
                                {
                                    boxLabel    : '1 De las recuperaciones',
                                    name        : 'per_rec_ciclos',
                                    inputValue  : 2
                                },
                                {
                                    boxLabel    : 'No aplica',
                                    name        : 'per_rec_ciclos',
                                    inputValue  : 3
                                }
                            ]
                        }
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype		: 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype	: 'saveButton',
                            itemId	: 'btnSave',
                            iconAlign	: 'left',
                            handler : function (btn) {
                                var win     = btn.up('window'),
                                    me      = Admin.getApplication(),
                                    form    = win.down('form'),
                                    record  = form.getRecord(),
                                    values  = form.getValues(),
                                    store   = Ext.getStore('ConfiguracionCiclosStore');

                                record.set(values);
                                store.sync({
                                    success : function(batch, o) {
                                        me.showResult('Se guardaron los datos correctamente.')
                                    },
                                    failure : function (e, r) {
                                        me.onError('Ocurrio un error, no se guardaron los cambios.');
                                    }
                                });
                            }
                        },'-',
                        {
                            xtype	: 'closebutton',
                            itemId	: 'btnUndo',
                            iconAlign	: 'left'
                        }
                    ]
                }
            ]
        }
    ]
});
