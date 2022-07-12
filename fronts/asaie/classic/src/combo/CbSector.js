Ext.define('Admin.combo.CbSector',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.SectorStore'
    ],
	alias	    : 'widget.CbSector',
	fieldLabel	: 'Sector:',
	name		: 'ID_SECTOR',
    displayField: 'SECTOR',
    valueField	: 'COD_SEC',
	reference 	: 'CbSector',
    publishes   : 'value',
    store		: 'SectorStore'
});