/**
 * Created by LOPEZSOFT2 on 9/03/2017.
 */
var imageTpl = new Ext.XTemplate(
    '<tpl for=".">',
        '<div class="thumb-wrap-v">',
            '<div class="thumb-v">',
                '<img src="{[values.type == 1 ? values.path_download : "assets/img/files/128/"+values.format+".png" ]}"/>',
            '</div>',
            '<span>{name}</span>',
        '</div>',
    '</tpl>'
);
Ext.define('Admin.view.docs.ImageBrowserView',{
    extend: 'Ext.view.View',
    alias: 'widget.ImageBrowserView',
    uses: 'Admin.store.docs.ImageBrowserStore',
    id  : 'img-chooser-view-v',
    singleSelect: true,
    overItemCls : 'x-view-over',
    itemSelector: 'div.thumb-wrap-v',
    tpl         : imageTpl,
    store       : 'ImageBrowserStore',
    liveDrag    : true,
    initComponent: function() {
        this.callParent(arguments);
    }
});