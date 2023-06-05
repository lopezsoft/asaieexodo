/**
 * Created by LOPEZSOFT on 16/05/2016.
 */
Ext.define('Admin.store.LanguageStore',{
   extend   : 'Ext.data.Store',
   storeId  : 'LanguageStore',
   urlCrtl	: '', // Propiedad para controlar si la URL a sido cargada
   pageSize	: 100,
   requires : [
       'Admin.model.LanguageModel'
   ],
   autoLoad : false,
   autoSync : true,
   model    : 'Admin.model.LanguageModel',
   proxy: {
      type  : 'ajax',
      url   : "/globales/locale/language-",
      reader	: {
         type			: 'json',
         rootProperty	: 'records',
         totalProperty	: 'reccount'
      },
      timeout : 20000,

      listeners: {
         exception: function(proxy, response, operation){
            Ext.MessageBox.show({
               title: 'REMOTE EXCEPTION',
               msg: "Ha ocurrido un error en el Servidor: " +response.responseText,
               icon: Ext.MessageBox.ERROR,
               buttons: Ext.Msg.OK
            });
         }
      }
   },
   listeners: {
      beforeload: function (xStore, operation, eOpts ){
         var me = this,
             urlSet = globales.General.language+'.json',
             baseUrlSys = Admin.getApplication().urlLocation(), // Obtenemos la URL base
             datos	= null,
             proxy 	= null,
             pUrl	= null,
             urlAll = null,

         datos 	= xStore; // Guardamos el Store
         proxy 	= datos.getProxy(); // Obtenemos el PROXY de Ajax
         pUrl	= proxy.url; // Obtenemos la URL que se ha pasado para la consulta el servidor
         urlAll = baseUrlSys + pUrl + urlSet;
         if (me.urlCrtl === '') { // La Url no ha sido cargada, se carga.
            proxy.setUrl(urlAll);
            me.urlCrtl	= 'baseFull'; // Se llena la propiedad que controla la carga de la URL.
         }
      }
   }
});