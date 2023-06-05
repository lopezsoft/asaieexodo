Ext.define('Admin.field.MultipleChoiceQuestion',{
    extend  : 'Ext.form.FieldContainer',
    defaultType : 'customtext',
    labelStyle	: 'font-weight:bold',
    layout      : 'hbox',
    alias		: 'widget.multiplechoicequestion',
    config      : {
        answerId    : 0
    },
    items       : [
        {
            xtype       : 'image',
            glyph       : 'f192@FontAwesome',
            width       : 37,
            height      : 37,
            margin      : '0 1 0 1'
        },
        {
            xtype       : 'hidden',
            name        : 'obj_id'
        },
        {
            flex        : 1,
            margin      : '0 1 0 1',
            value       : 'Opción',
            listeners   : {
                change : function(ts){
                    if(ts.up('form')){
                        ts.up('form').changeCls(1);
                    }
                }
            },
            name        : 'answer'
        },
        {
            xtype       : 'customnumberfield',
            name        : 'points',
            width       : 90,
            value       : 0.0,
            readOnly    : true,
            margin      : '0 1 0 1',
            emptyText   : '0.00',
            fieldLabel  : '%',
            labelAlign  : 'right',
            labelWidth	: 25
        },
        {
            xtype       : 'customcheckboxfield',
            boxLabel    : 'Correcta',
            name        : 'correct',
            handler     : function(btn){
                btn.up('form').onValorRespuestaRd(btn);
                btn.up('form').changeCls(1);
            }
        },
        {
            xtype       : 'customButton',
            iconCls     : 'x-fa fa-trash',
            ui          : 'header-red',
            tooltip     : 'Eliminar respuesta',
            margin      : '0 0 0 1',
            handler     : function (btn) {
                var
                    parent  = btn.up('multiplechoicequestion'),
                    win     = parent.up('form');
                win.onDeleteObj(parent);
            }
        }
    ]
});