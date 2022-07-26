Ext.define('Admin.store.base.StoreUrlSocket',{
	extend		: 'Ext.data.Store',
    storeId		: 'StoreUrlSocket',
    pageSize	: 15,
	urlCrtl		: '', // Propiedad para controlar si la URL a sido cargada
    proxy: {
		type	: 'socketio',
		typeData: 'Ajax',//'SocketIO',
        storeId	: 'StoreApiSocket',
		timeout : 60000,
		host	: Global.getHostSocket(),
	    reader	: {
	         type			: 'json',
	         rootProperty	: 'records',
	         totalProperty	: 'total'  
	    },
		listeners: {
	        exception: function(proxy, response, operation){
	        	var
					r = Ext.decode(response.responseText);
	            Ext.MessageBox.show({
	                title	: 'REMOTE EXCEPTION',
	                msg		: "Ha ocurrido un error en el Servidor: " +r.sqlMessage,
	                icon	: Ext.MessageBox.ERROR,
	                buttons	: Ext.Msg.OK
	            });
	        }
       }
	},
	listeners: {
		beforesync : function (o , eOpts) {
			var me = this,
				baseUrlSys = Admin.getApplication().getUrlBase(), // Obtenemos la URL base
				datos	= null,
				proxy 	= null,
				pUrl	= null,
				pApi	= null;

			datos 	= this; // Guardamos el Store
			proxy 	= datos.getProxy(); // Obtenemos el PROXY de Ajax
			pUrl	= proxy.url; // Obtenemos la URL que se ha pasado para la consulta el servidor
			pApi	= proxy.getApi();
			if (proxy.typeData == 'Ajax'){
				if (me.urlCrtl === '') { // La Url no ha sido cargada, se carga.
					if (pUrl === '') {

						cCreate = baseUrlSys + pApi.create;
						cDestroy = baseUrlSys + pApi.destroy;
						cRead = baseUrlSys + pApi.read;
						cUpdate = baseUrlSys + pApi.update;

						api = {
							create: cCreate,
							read: cRead,
							update: cUpdate,
							destroy: cDestroy
						};

						proxy.setApi(api);

					} else {
						proxy.setUrl(baseUrlSys + pUrl);
					};

					me.urlCrtl	= 'baseFull' ;// Se llena la propiedad que controla la carga de la URL.
				}
			}
		},

		beforeload: function (xStore, operation, eOpts ){
			var me = this,
				baseUrlSys = Admin.getApplication().getUrlBase(), // Obtenemos la URL base
				datos	= null,
				proxy 	= null,
				pUrl	= null,
				pApi	= null;

			datos 	= xStore; // Guardamos el Store
			proxy 	= datos.getProxy(); // Obtenemos el PROXY de Ajax
			pUrl	= proxy.url; // Obtenemos la URL que se ha pasado para la consulta el servidor
			pApi	= proxy.getApi();
			if (proxy.typeData == 'Ajax'){
				if (me.urlCrtl === '') { // La Url no ha sido cargada, se carga.
					if (pUrl === '') {

						cCreate = baseUrlSys + pApi.create;
						cDestroy = baseUrlSys + pApi.destroy;
						cRead = baseUrlSys + pApi.read;
						cUpdate = baseUrlSys + pApi.update;

						api = {
							create: cCreate,
							read: cRead,
							update: cUpdate,
							destroy: cDestroy
						};

						proxy.setApi(api);

					} else {
						proxy.setUrl(baseUrlSys + pUrl);
					};

					me.urlCrtl	= 'baseFull' ;// Se llena la propiedad que controla la carga de la URL.
				}
			}
		}
	}
});
