Ext.define('Admin.base.SaveWindow' ,{
    extend: 'Admin.base.WindowCrud',
    requires: [
        'Ext.grid.filters.Filters'
    ],
    alias           : 'widget.savewindow',
    xtype           : 'savewindow',
    title			: 'Guardar/Editar',
    closeAction     : 'hide'
 });