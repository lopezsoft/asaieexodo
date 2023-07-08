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
		const params	= AuthToken.recoverParams();
		const dt		= new Date();
        let
            me          = this,
            treeStore   = 'NavigationTree',
            nameApp     = AppLang.getSMainMenu(),
            user  		= params.user,
            schoolData  = params.school;
			Global.setYear(schoolData.year);
		const {profile}	= params;
        me.items = [
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
                        value       : (schoolData) ? (schoolData.year) : dt.getFullYear(),
                        width       : 85,
                        fieldLabel  : '',
                        hideTrigger	: false,
                        tooltip     : AppLang.getSToolTipChangeYear(),
                        itemId      : 'nfYear',
						listeners	: {
							change( ob , newValue ) {
								const ts  		= ob.up('viewport');
								AuthToken.changeYear(newValue);
								ts.getController().redirectTo((localStorage.getItem('currentRoute')) ? localStorage.getItem('currentRoute') : 'dashboard',true);
								Admin.getApplication().showResult(AppLang.getSDbChangeYear());
							}
						}
                    },
                    '->',
                    '-',
                    {
                        xtype       : 'badgebutton',
                        badgeCls    : 'x-btn-badgeCls-green',
                        itemId      : 'emailButton',
                        visible     : false,
                        tooltip     : 'Correos recibidos',
                        handler     : function (btn) {
							const e = Ext.getElementById('notif_email');
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
                        text    : (user) ? (user.fullname+' - ' + profile.profile_name.toUpperCase() || '') : 'Demo'
                    },
                    {
                        xtype   : 'image',
                        cls     : 'header-right-profile-image',
                        height  : 32,
                        width   : 32,
                        alt     : AppLang.getSToolTipUserProfile(),
                        itemId  : 'imgUser',
                        src     : (Ext.isEmpty(user.avatar)) ? Global.getAvatarUnknoun() : Global.getUrlBase() + user.avatar,
                        imgCls  : 'avatar-background',
                        tooltip : AppLang.getSToolTipUserProfile()
                    },
                    {
                        ui      : 'header',
                        iconCls :'x-fa fa-navicon',
                        menu    : [
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