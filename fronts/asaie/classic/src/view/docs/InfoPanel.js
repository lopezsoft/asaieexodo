var imageTpl = new Ext.XTemplate(
    '<div class="details">',
        '<tpl for=".">',
            '<img src="{[values.type == 1 ? values.path_download : "assets/img/files/128/"+values.format+".png" ]}"/>',
            '<div class="details-info">',
                '<b>Nombre del archivo:</b>',
                '<span>{name}</span>',
                '<b>URL Descarga:</b>',
                '<span><a href="{path_download}" target="_blank">{path_download}</a></span>',
                '<b>Extensión:</b>',
                '<span>{format}</span>',
                '<b>Peso:</b>',
                '<span>{size} MB</span>',
            '</div>',
        '</tpl>',
    '</div>'
);
Ext.define('Admin.view.docs.InfoPanel',{
    extend: 'Ext.panel.Panel',
    ui      : 'panel-white',
    alias   : 'widget.InfoPanel',
    id      : 'img-chooser-dlg',
    width   : 256,
    minWidth: 150,
    tpl     : imageTpl,
    afterRender: function(){
        this.callParent();
        if (!Ext.isWebKit) {
            this.el.on('click', function(){
                //alert('The Sencha Touch examples are intended to work on WebKit browsers. They may not display correctly in other browsers.');
            }, this, {delegate: 'a'});
        }
    },
    /**
     * Loads a given image record into the panel. Animates the newly-updated panel in from the left over 250ms.
     */
    loadRecord: function(image) {
        this.body.hide();
        this.tpl.overwrite(this.body, image.data);
        this.body.slideIn('l', {
            duration: 250
        });
    },
    clear: function(){
        this.body.update('');
    }
});