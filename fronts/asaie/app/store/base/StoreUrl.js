Ext.define('Admin.store.base.StoreUrl',{
	extend		: 'Ext.data.Store',
	storeId		: 'StoreUrl',
    pageSize	: 15,
	urlCrtl		: '', // Propiedad para controlar si la URL a sido cargada
    proxy: {
		type	: 'ajax',
		headers: {
			'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
		},
		extraParams: {
			...Global.getSchoolParams(),
		},
	    reader	: {
	        type			: 'json',
	        rootProperty	: 'records.data',
	        totalProperty	: 'total'
	    },
		timeout : 60000,
		listeners: {
	        exception: function(proxy, response){
				const resp = JSON.parse(response.responseText);
				Ext.create('Ext.window.MessageBox', {
					alwaysOnTop	: true,
					modal		: true,
					closeAction	: 'destroy'
				}).show({
	                title: 'REMOTE EXCEPTION',
	                msg: "Ha ocurrido un error en el Servidor: " + resp.error || resp.message,
	                icon: Ext.MessageBox.ERROR,
	                buttons: Ext.Msg.OK
	            });
	        }
       }
	},

	listeners: {
		beforesync : function () {
			this.updateProperties(this);
		},

		beforeload: function (){
			this.updateProperties(this);
		}
	},

	updateProperties: (me) => {
		const 	baseUrlSys 	= Global.getApiUrl() + '/'; // Obtenemos la URL base
		const 	proxy 		= me.getProxy(); // Obtenemos el PROXY de Ajax
		const 	proxApi		= proxy.getApi();
		let 	extraParams = proxy.getExtraParams();
		extraParams	= {...extraParams, ...Global.getSchoolParams()};
		proxy.setExtraParams(extraParams);
		if(me.urlCrtl.length === 0) {
			if (proxy.url.length > 0) {
				proxy.setUrl(baseUrlSys + proxy.url);
			}else{
				proxy.setApi({
					create	: baseUrlSys + proxApi.create,
					read	: baseUrlSys + proxApi.read,
					update	: baseUrlSys + proxApi.update,
					destroy	: baseUrlSys + proxApi.destroy
				});
			}

			me.urlCrtl	= 'baseFull' ;// Se llena la propiedad que controla la carga de la URL.
		}
	}
});
