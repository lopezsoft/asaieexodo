Ext.define('Admin.button.WebcamButton',{
	extend	: 'Admin.button.CustomButton',
	alias		: 'widget.btnWebcam',
	tooltip     : 'Cámara web',
	itemId      : 'btnWebcam',
	disabled  	: true,
	iconCls     : 'x-fa fa-camera',
	handler     : function (btn) {
		console.log(btn.itemId);
	}
});
