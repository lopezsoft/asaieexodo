Ext.define('Admin.group.CustomRadioGroup',{
    extend      : 'Ext.form.RadioGroup',
    labelStyle	: 'font-weight:bold',
    labelWidth	: 180,
    alias       : 'widget.customradiogroup',
    msgTarget	: 'side',
    allowBlank  :false,
    columns     : 1,
    vertical    : true
});