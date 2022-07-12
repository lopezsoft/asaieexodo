/**
 * Created by LOPEZSOFT on 25/04/2016.
 */
/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.container.ResponsiveContainer',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    alias   : 'widget.responsiveContainer',

    layout: 'responsivecolumn'
});
