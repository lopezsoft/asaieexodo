/**
 * Created by LOPEZSOFT on 6/12/2015.
 */
Ext.define('Admin.toolbar.Pagination', {
    extend  : 'Ext.toolbar.Paging',
    alias   : 'widget.pagination',
    xtype   : 'pagination',
    dock	: 'bottom',
    resizable   : false,
    scrollable  : true,
    displayInfo : true,
    // cls         : 'color-tool',
    config  :{
        showPrint: false,
        showExport: false
    },
    items 		: [
        {
            xtype       : 'exportButton'
        },
        {
            xtype		: 'printButton'
        }
    ],
    listeners : {
        afterrender : function(ob, e){
            if (ob.down('#printButton')) {
                ob.down('#printButton').setVisible(ob.getShowPrint());
            }
            if (ob.down('#exportButton')) {
                ob.down('#exportButton').setVisible(ob.getShowExport());
            }
        }
    }
});