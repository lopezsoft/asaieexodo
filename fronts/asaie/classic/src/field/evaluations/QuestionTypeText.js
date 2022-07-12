Ext.define('Admin.field.QuestionTypeText',{
    extend  : 'Ext.form.FieldContainer',
    labelStyle	: 'font-weight:bold',
    layout      : 'hbox',
    alias		: 'widget.questiontypetext',
    config      : {
        answerId    : 0
    },
    items       : [
        {
            xtype       : 'image',
            glyph       : 'f036@FontAwesome',
            width       : 37,
            height      : 37,
            margin      : '0 1 0 1'
        },
        {
            xtype       : 'customtext',
            draggable   : true,
            liveDrag    : true,
            flex        : 1,
            margin      : '0 1 0 1',
            readOnly    : true,
            value       : 'Texto de la respuesta',
            name        : 'answer'
        },
        {
            xtype       : 'customnumberfield',
            name        : 'points',
            width       : 90,
            value       : 100,
            readOnly    : true,
            margin      : '0 1 0 1',
            emptyText   : '0.00',
            fieldLabel  : '%',
            labelAlign  : 'right',
            labelWidth	: 25
        },
        {
            xtype       : 'customButton',
            iconCls     : 'x-fa fa-trash',
            ui          : 'header-red',
            tooltip     : 'Eliminar respuesta',
            margin      : '0 0 0 1',
            handler     : function (btn) {
                var
                    parent  = btn.up('questiontypetext'),
                    win     = parent.up('form');
                win.onDeleteObj(parent);
            }
        }
    ]
});