/**
 * Created by LOPEZSOFT on 8/06/2016.
 */
Ext.define('Admin.toolbar.CustomToolbar', {
    extend  : 'Ext.toolbar.Toolbar',
    alias   : 'widget.customToolbar',
    xtype   : 'customtoolbar',
    dock    : 'top',
    scrollable  : true,
    // cls         : 'color-tool',
    frmBind	    : true,
    defaultType : 'customButton'
});
