/**
 * Created by LOPEZSOFT on 2/06/2016.
 */
Ext.define('Admin.button.ButtonChat',{
    extend	: 'Ext.button.Button',
    alias	: 'widget.btnChat',
    itemId	: 'customButton',
    tooltipType : 'title',
    iconCls		: 'x-fa fa-comments',
    textAlign	: 'left',
    cls         : 'parpadea chat-button',
    ui          : 'chat',
    handler     : function (btn) {
        cUrl    = Global.getUrlBase()+"support";
        window.open(cUrl,'_blank');
    }
});