var imageTpl = new Ext.XTemplate(
    '<div class="details">',
        '<tpl for=".">',
            '<img src="{[values.type === 1 ? values.file_path : "assets/img/files/128/"+values.extension_file+".png" ]}"/>',
            '<div class="details-info">',
                '<b>Nombre del archivo:</b>',
                '<span>{file_description}</span>',
                '<b>URL Descarga:</b>',
                '<span><a href="{file_path}" target="_blank">{file_path}</a></span>',
                '<b>Extensión:</b>',
                '<span>{extension_file}</span>',
                '<b>Peso:</b>',
                '<span>{size_file} KB</span>',
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
        this.tpl.overwrite(this.body, image.data, false);
        this.body.slideIn('l', {
            duration: 250
        });
    },
    clear: function(){
        this.body.update('');
    }
});
