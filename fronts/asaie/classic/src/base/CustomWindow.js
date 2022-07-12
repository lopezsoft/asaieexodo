Ext.define('Admin.base.CustomWindow' ,{
    extend: 'Admin.base.WindowCrud',
    requires: [
        'Ext.grid.filters.Filters'
    ],
    alias           : 'widget.customWindow',
    width	        : 600,
    title			: 'Custom window',
    maximizable     : true
 });