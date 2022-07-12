Ext.define('Admin.field.FieldContainer',{
    extend  : 'Ext.form.FieldContainer',
    border	: 0,
    style: {
        borderStyle: 'none'
    },
    defaultType : 'customtext',
    labelStyle	: 'font-weight:bold',
    layout	    : 'vbox',
    defaults	: {
        flex: 1,
        labelWidth: 120
    },
    bodyPadding: 2,
    alias		: 'widget.fieldContainer'
});