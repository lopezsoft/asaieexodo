/**
 * Created by LEWIS on 27/11/2015.
 */
Ext.define('Admin.view.docentes.controller.SeguimientoController',{
    extend  : 'Admin.base.BaseController',
    alias: 'controller.seguimiento',
    init    : function() {
        this.setConfigVar();
    },

    onViewFormato01 : function (btn) {
        this.redirectTo('formatoseguimientodocente', true);
	},
    onViewFormato02 : function (btn) {
        this.redirectTo('formatoseguimientodocente', true);
	},
    onViewFormato03 : function (btn) {
        this.redirectTo('formatoseguimientodocente', true);
	},
	
    onViewObservador : function (btn) {
        this.redirectTo('fichaseguimientodocente', true);
    }
});
