/**
 * Created by LOPEZSOFT2 on 2/04/2017.
 */
Ext.tip.QuickTipManager.init();  // enable tooltips
Ext.define('Admin.field.HtmlEditor',{
    extend  : 'Ext.form.field.HtmlEditor',
    alias   : 'widget.customhtmleditor',
    type    : 'customhtmleditor',
    labelAlign          : 'top',
    shim                : true,
    labelStyle	        : 'font-weight:bold',
    allowBlank 	        : false,
    enableSourceEdit    : true,
    keyMapEnabled       : true,
    enableFont	        : false,
    flex                : 1,
    labelWidth	        : 180,
    height              : 180
    // fontFamilies        : [
    //     ''
    // ]
});