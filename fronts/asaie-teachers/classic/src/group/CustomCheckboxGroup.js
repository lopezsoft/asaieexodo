Ext.define('Admin.group.CustomCheckboxGroup',{
    extend      : 'Ext.form.CheckboxGroup',
    labelStyle	: 'font-weight:bold',
    labelWidth	: 180,
    alias       : 'widget.customcheckboxgroup',
    msgTarget	: 'side',
    allowBlank  :false,
    columns     : 1,
    vertical    : true
});