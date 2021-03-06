Ext.define('Admin.view.main.Main', {
    extend: 'Ext.container.Viewport',
    
    requires: [
        'Ext.button.Segmented',
        'Admin.view.main.MainContainerWrap',
        'Ext.list.Tree'
    ],
    alias       : 'widget.Main',
    controller  : 'main',
    viewModel   : 'main',

    cls         : 'sencha-dash-viewport',
    itemId      : 'mainView',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    listeners: {
        render: 'onMainViewRender'
    },
    initComponent: function () {
        let 
            me          = this,
            treeStore   = 'NavigationTree',
            nameApp     = AppLang.getSMainMenu()
            reports     = [],
            user  		= AuthToken.recoverParams().user,
            membership  = AuthToken.recoverParams().membership,
            schoolData  = AuthToken.recoverParams().school;
			Global.setYear(schoolData.year);
        me.items = [
            {
                xtype   : 'toolbar',
                cls     : 'sencha-dash-dash-headerbar-blue',
                height  : 64,
                items   : [
					{
						xtype       : 'tbtext',
						cls			: 'membership-icon',
						html		: '<i class="fas fa-award"></i>'
					},
					{
						xtype       : 'label',
						cls			: (membership.state == 1) ? 'membership-text-active' : 'membership-text-inactive', 
						text 		: (membership.state == 1) ? 'cuenta activa hasta: ' + membership.lockdate : 'cuenta inactiva'
					},
                    '->',
                    {
                        xtype   : 'tbtext',
                        cls     : 'name-text',
                        text    : (schoolData.school_name) ? schoolData.school_name : 'Escuela Demo'
                    },
                    {
                        xtype   : 'image',
                        cls     : 'header-right-profile-image',
                        height  : 32,
                        width   : 32,
                        alt     : 'Logo institucional',
                        src     : (Ext.isEmpty(reports.logo)) ? Global.getAvatarUnknoun() : reports.logo,
                        imgCls  : 'avatar-background',
                        tooltip : 'Logo institucional'
                    }
                ]
            },
            {
                xtype   : 'toolbar',
                cls     : 'sencha-dash-dash-headerbar shadow',
                height  : 64,
                itemId  : 'headerBar',
                items: [
                    {
                        xtype       : 'component',
                        reference   : 'senchaLogo',
                        cls         : 'sencha-logo',
                        html        : '<div class="main-logo"><img width=32 height=32 src="/assets/img/logo.png">'+nameApp+'</div>',
                        width       : 250
                    },
                    {
                        margin      : '0 2 0 4',
                        ui          : 'header',
                        iconCls     :'x-fa fa-navicon',
                        id          : 'main-navigation-btn',
                        handler     : 'onToggleNavigationSize'
                    },
                    {
                        xtype		: 'yearField',
                        allowBlank	: false,
                        name		: 'year',
                        value       : (schoolData) ? (schoolData.year) : 0,
                        width       : 85,
                        fieldLabel  : '',
                        hideTrigger	: false,
                        tooltip     : AppLang.getSToolTipChangeYear(),
                        itemId      : 'nfYear',
						listeners	: {
							change( ob , newValue , oldValue , eOpts ) {
								const ts  		= ob.up('viewport');
								AuthToken.changeYear(newValue);
								ts.getController().redirectTo((localStorage.getItem('currentRoute')) ? localStorage.getItem('currentRoute') : 'dashboard',true);
								Admin.getApplication().showResult(AppLang.getSDbChangeYear());
							}
						}
                    },
                    '->',
                    ,'-',
                    {
                        xtype       : 'badgebutton',
                        badgeCls    : 'x-btn-badgeCls-green',
                        itemId      : 'emailButton',
                        visible     : false,
                        tooltip     : 'Correos recividos',
                        handler     : function (btn) {
                            var
                                e  = Ext.getElementById('notif_email');
                            if (e) {
                                e.play();
                            }
                        },
                        iconCls     : 'x-fa fa-envelope'
                    },
                    {
                        xtype   : 'btnChat',
                        tooltip: AppLang.getSTootTipHelp()
                    },
                    {
                        xtype   : 'button',
                        iconCls : 'x-fa fa-home',
                        ui      : 'header',
                        itemId  : 'btnHome',
                        handler : 'onToolBarChange',
                        tooltip : 'Inicio'
                    },
                    {
                        xtype   : 'tbtext',
                        cls     : 'top-user-name',
                        itemId  :'btnUser',
                        text    : (user) ? (user.fullname) : 'Demo'
                    },
                    {
                        xtype   : 'image',
                        cls     : 'header-right-profile-image',
                        height  : 32,
                        width   : 32,
                        alt     : AppLang.getSToolTipUserProfile(),
                        itemId  : 'imgUser',
                        src     : (Ext.isEmpty(user.avatar)) ? Global.getAvatarUnknoun() : user.avatar,
                        imgCls  : 'avatar-background',
                        tooltip : AppLang.getSToolTipUserProfile()
                    },
                    {
                        ui      : 'header',
                        iconCls :'x-fa fa-navicon',
                        menu    : [
                            {
                                text    : 'Perf??l',
                                iconCls : 'far fa-id-badge',
                                handler : 'onProfile'
                            },'-',
                            {
                                text    : 'Salir',
                                iconCls : 'fas fa-sign-out-alt',  
                                handler : 'onCloseSesion'
                            }
                        ]
                    }
                ]
            },
            {
                xtype       : 'maincontainerwrap',
                id          : 'main-view-detail-wrap',
                reference   : 'mainContainerWrap',
                flex        : 1,
                items: [
                    {
                        xtype           : 'treelist',
                        reference       : 'navigationTreeList',
                        itemId          : 'navigationTreeList',
                        ui              : 'navigation',
                        store           : treeStore,
                        micro           : false,
                        width           : 250,
                        expanderFirst   : false,
                        expanderOnly    : false,
                        listeners: {
                            selectionchange: 'onNavigationTreeSelectionChange'
                        }
                    },
                    {
                        xtype       : 'container',
                        flex        : 1,
                        reference   : 'mainCardPanel',
                        cls         : 'panel-body-ligh',
                        itemId      : 'contentPanel',
                        padding     : 5,
                        layout      : {
                            type    : 'card',
                            anchor  : '100%'
                        }
                    }
                ]
            }
        ];
        me.callParent(arguments);

    }
});
