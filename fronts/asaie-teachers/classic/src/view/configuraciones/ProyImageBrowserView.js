/**
 * Created by LOPEZSOFT2 on 9/03/2017.
 */

var imageTpl = new Ext.XTemplate(
    '<tpl for=".">',
    '<div class="thumb-wrap-v">',
    '<div class="thumb-v">',
    '<img src="{path_download}" />',
    '</div>',
    '<span>{name}</span>',
    '</div>',
    '</tpl>'
);

Ext.define('Admin.view.configuraciones.ProyImageBrowserView',{
    extend: 'Ext.view.View',
    alias: 'widget.ProyImageBrowserView',

    uses: 'Admin.store.general.ProyTransvImageBrowserStore',
    id  : 'img-chooser-view-v',
    singleSelect: true,
    overItemCls : 'x-view-over',
    itemSelector: 'div.thumb-wrap-v',
    tpl         : imageTpl,
    store       : 'ProyTransvImageBrowserStore',
    liveDrag    : true,
    items           : {
        xtype   : 'customButton',
        text    : 'Ejemplo'
    },
    initComponent: function() {
        this.callParent(arguments);
    }
});