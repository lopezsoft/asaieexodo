/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.MayusView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.MayusView',
    itemId      : 'MayusView',
    maxWidth       : 600,
    maxHeight      : 200,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Pasar a Mayúsculas logros - desempeños - indicadores - estándares '+' - '+ Global.getYear());
    },
    
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 80
            },
            items   : [
                {
                    xtype   : 'CbPeriodos',
                    width   : 250
                }
            ],
            dockedItems : [
                {
                    xtype   : 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype       : 'customButton',
                            text        : 'Porcesar...',
                            iconCls     : 'x-fa fa-spinner',
                            bind        : {
                                disabled    : '{!periodo.value}'
                            },
                            handler     : function (btn) {
                                var
                                    win = btn.up('window'),
                                    me  = Admin.getApplication(),
                                    gb  = Global;
                                Ext.Msg.show({
                                    title	: 'Pasar a Mayúsculas',
                                    message	: 'Desea pasar a Mayúsculas tanto logros e indicadores?. ' +
                                    'Tenga en cuenta que este proceso es irreversible.',
                                    buttons	: Ext.Msg.YESNO,
                                    icon	: Ext.Msg.QUESTION,
                                    fn: function(btn) {
                                        if (btn === 'yes') {
                                            win.mask('Actualizado...');
                                            Ext.Ajax.request({
                                                params  : {
                                                    pdbPeriodo : win.down('#periodo').value
                                                },
                                                url: gb.getUrlBase() +'academic/get_mayus',

                                                success: function(response, opts) {
                                                    me.showResult('Proceso realizado correctamente');
                                                },
                                                failure: function(response, opts) {
                                                    me.onError(response.status);
                                                },callback : function(){
                                                    win.unmask();
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                        },'-',
                        {
                            xtype	: 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});