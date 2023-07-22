Ext.define('Admin.view.main.MainController', {
    extend: 'Admin.base.BaseController',
    alias: 'controller.main',
    init: function(){
        this.setConfigVar();
    },

    listen : {
        controller : {
            '#' : {
                unmatchedroute : 'onRouteChange'
            }
        }
    },

    routes: {
        ':node': 'onRouteChange'
    },

    lastView: null,

    setCurrentView: function(hashTag) {
        hashTag = (hashTag || '').toLowerCase();
		let xrefs = this.getReferences();
        let me                  = this,
            refs                = me.getReferences(),
            mainCard            = refs.mainCardPanel,
            mainLayout          = mainCard.getLayout(),
            navigationList      = refs.navigationTreeList,
            store               = navigationList.getStore(),
            node                = store.findNode('routeId', hashTag) || store.findNode('viewType', hashTag),
            view                = (node && node.get('viewType')) || hashTag,
            lastView            = me.lastView,
            existingItem        = mainCard.child('component[routeId=' + hashTag + ']'),
            newView;
        // Kill any previously routed window
        if (lastView && lastView.isWindow) {
            lastView.destroy();
        }

        lastView = mainLayout.getActiveItem();

        if (!existingItem) {
            newView = Ext.create({
                xtype: view,
                routeId: hashTag,  // for existingItem search later
                hideMode: 'offsets'
            });
        }

        if (!newView || !newView.isWindow) {
            // !newView means we have an existing view, but if the newView isWindow
            // we don't add it to the card layout.
            if (existingItem) {
                // We don't have a newView, so activate the existing view.
                if (existingItem !== lastView) {
                    mainLayout.setActiveItem(existingItem);
                }
                newView = existingItem;
            }
            else {
                // newView is set (did not exist already), so add it and make it the
                // activeItem.
                Ext.suspendLayouts();
                mainLayout.setActiveItem(mainCard.add(newView));
                Ext.resumeLayouts(true);
            }
        }

        navigationList.setSelection(node);

        if (newView.isFocusable(true)) {
            newView.focus();
        }

        me.lastView = newView;
    },

    onRemove    : function(hashTag){
        hashTag = (hashTag || '').toLowerCase();
        xrefs                   = this.getReferences();
        var me                  = this,
            refs                = me.getReferences(),
            mainCard            = refs.mainCardPanel,
            existingItem        = mainCard.down(hashTag);
        if (existingItem) {
           mainCard.remove(existingItem,{destroy : true});
        }
    },

    setChangeCurrentView : function(hashTag, hastView){
        hashTag = (hashTag || '').toLowerCase();
        xrefs                   = this.getReferences();
        var me                  = this,
            refs                = me.getReferences(),
            mainCard            = refs.mainCardPanel,
            mainLayout          = mainCard.getLayout(),
            view                = hastView;
        Ext.suspendLayouts();
        mainLayout.setActiveItem(mainCard.add(view));
        Ext.resumeLayouts(true);

        this.redirectTo(hashTag);
    },

    onNavigationTreeSelectionChange: function (tree, node) {
        var to = node && (node.get('routeId') || node.get('viewType'));
        if (to) {
            this.redirectTo(to);
        }
    },


    onMainViewRender:function() {
        if (!window.location.hash) {
            this.redirectTo("dashboard");
        }
    },

    onRouteChange:function(id){
        var me  = this;
        Ext.require('Admin.*');
        me.mask('Cargando app...');
        Ext.onReady(function(){
            me.unmask();
            localStorage.setItem('oldRoute', (localStorage.getItem('currentRoute')) ? localStorage.getItem('currentRoute') : 'dashboard');
			localStorage.setItem('currentRoute',id);
			if(id === 'dashboard'){
				me.setCurrentView(id);
			}else if(Global.isActive()){
				me.setCurrentView(id);
			}else{
				Swal.fire({
					position	: 'top-end',
					icon		: 'warning',
					title		: 'Cuenta suspendida',
					text		: 'Sistema temporalmente fuera de servicio.',
					showConfirmButton: false,
					timer: 10000
				});
			}
        })
    },

    onSearchRouteChange: function () {
        this.setCurrentView('searchresults');
    },

    onEmailRouteChange: function () {
        this.setCurrentView('email');
    },

    onStudentsActivities : function(){
        this.redirectTo('studentsactivities', true);
    },

    onStudentsEvaluations : function(){
        this.redirectTo('studentsevaluations', true);
    },

    onProfile   : function(){
        this.redirectTo('profile', true);
    },
    onToolBarChange : function(){
        this.redirectTo("dashboard");
    }
});
