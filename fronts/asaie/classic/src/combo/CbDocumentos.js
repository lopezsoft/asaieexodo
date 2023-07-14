/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.combo.CbDocumentos',{
    extend	: 'Admin.combo.CustomComboBox',
    requires: [
        'Admin.store.general.DocumentosStore'
    ],
    alias	    : 'widget.CbDocumentos',
    fieldLabel	: 'Documento de identidad',
    name		: 'cod_doc',
    displayField: 'tipo',
    valueField	: 'id',
    itemId		: 'CbDocumentos',
    reference 	: 'CbDocumentos',
    publishes   : 'value',
    store		: 'DocumentosStore'
});
