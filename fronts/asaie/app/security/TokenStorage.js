Ext.define('Admin.security.TokenStorage', {
    alternateClassName: ['TokenStorage', 'AuthToken'],
    singleton : true,
    constructor: function (cfg) {
		const me = this;
		me.initConfig(cfg);
    },
    config: {
        storageKey  	: 'asaie-exodo-jwt',
        storageOut   	: 'token-dashboard'
    },  

    redirectTo : function(){
		window.location.href = Global.getUrlBase() + 'auth/login';
    },
    
    clearOut : function () {
        localStorage.removeItem(this.getStorageOut());
    },

    clear: function () {
		localStorage.removeItem('oldRoute');
		localStorage.removeItem('currentRoute');
        localStorage.removeItem(this.getStorageKey());
        window.location.reload();
    },

	profileSettings: function () {
		const { profile } = this.recoverParams();
		return {
			isRector		: (profile.id === 2),
			isCoordinador	: (profile.id === 6),
			isSecretary		: (profile.id === 3),
		}
	},

    recoverParams : function(){
        let token   = this.recover();
        if (token){
            token = {
                access_token: token.access_token,
				school		: token.school,
                token_type	: token.token_type,
                user        : token.user,
                profile		: token.profile
            }
        }
        return token;
    },

	authorization: function() {
		const  params  = this.recoverParams();
		return (params) ? params.token_type + ' ' + params.access_token : '';
	},

	changeYear : function(year){
		const params =	this.recoverParams();
		if(params) {
			params.school.year	= year;
			this.save(JSON.stringify(params));
			Global.setYear(year);
		}
	},

	isActive: function() {
        const membership = this.recoverParams().school;
        return (membership.state === 1);
    },

    recoverOut: function() {
		let valToken = localStorage.getItem(this.getStorageOut()),
			token = {};
		if (valToken){
            token   = Ext.decode(valToken)
        }else{
            token   = null 
        }
        return token;
    },

    recover: function() {
		let valToken = localStorage.getItem(this.getStorageKey()),
			token = {};
		if (valToken){
            token   = Ext.decode(valToken)
        }else{
            token   = null 
        }
        return token;
    },

    save: function (token) {
        localStorage.setItem(this.getStorageKey(), token);
        this.clearOut();
    },

    isAuthenticated : function (){
		const out = this.recoverOut();
		if(out){
            this.save(JSON.stringify(out));
        }
        return !!this.recover();
    },

    onLogout: function () {
		const me = this,
			params = me.recoverParams(),
			app = Admin.getApplication();
		Ext.Ajax.request({
            url     : Global.getApiUrl() + '/auth/logout',
            headers: {
                'Authorization' : params.token_type +' ' + params.access_token
            },
            method      : 'GET',
            success: function(response, opts) {
                me.clear();
            },
            failure: function(response, opts) {
                app.showResult('server-side failure with status code ' + response.status);
            }
        });
    },

    onLogin : function (params) {
        const me  = this,
              app = Admin.getApplication();
        Ext.Ajax.request({
            url: Global.getApiUrl() + '/admin/auth/login',
            params : {
                remember_me : params.remember_me,
                user_name   : params.user_name,
                password    : params.password
            },
            method      : 'POST',
            success: function(response, opts) {
               var 
                    text    = response.responseText
                    obj     = Ext.decode(response.responseText);
                if(obj.success === true){
                    me.save(text);
                    app.showResult('Bienvenido al sistema, te has autenticado correctamente.');
					setTimeout(() => {
						window.location.reload();
					}, 500);
                }else{
                    app.showResult('Error de autenticación.');
                }
            },
            failure: function(response, opts) {
                app.showResult('server-side failure with status code ' + response.status);
            }
        });
    }
});
