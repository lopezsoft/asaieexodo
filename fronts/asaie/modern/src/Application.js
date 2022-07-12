Ext.define('Admin.Application', {
    extend: 'Ext.app.Application',
    name: 'Admin',
    requires    : [
        'Admin.*'
    ],
    defaultToken : 'dashboard',

    mainView: 'Admin.view.main.Main',

    profiles: [
        'Phone',
        'Tablet'
    ],

    stores: [
        'NavigationTree'
    ],

    launch : function(){
        Ext.onReady(function(){
            var loadingMask = Ext.get('global-spinner');
            // Ocultando la animación
            if (loadingMask){
                loadingMask.remove('global-spinner');
            }
        });
    }
});
