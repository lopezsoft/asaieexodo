/**
 * Created by LOPEZSOFT2 on 10/12/2016.
 */
Ext.define('Admin.view.admin.controller.AdminController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.admin',

    init: function () {
        me = this;
        me.setConfigVar();
	},
	
	onViewWebcam	: function (btn) {
		var me  	= Admin.getApplication(),
            view    = btn.up('window') || btn.up('form'),
			rec 	= view.down('grid').getSelection()[0],
            store   = view.down('grid').getStore();
        me.onStore('docs.ImageBrowserStore');
        Ext.create({
            xtype           : 'FilesView',
            title           : 'Imagenes del docente',
            pathReadFile    : 'c_docentes/read_images',
            pathUploadFile  : 'c_docentes/upload_foto',
            titlePanelLoad  : 'Capturar',
            titlePanelView  : 'Mis imágenes',
            textButtonApply : 'Aceptar',
            extraParams     : {
                pdbCodEst   : rec.get('id')
            }
        }).show().on('afterselect',function (me, select) {
            rec.set('image',select.data.path_set);
        }).on('apply',function (me) {
			store.sync();
			this.close();
        }).on('cancel',function (me) {
            store.rejectChanges();
        });
	},
    
    onCreateDirGrupo : function (btn) {
        var me = this.app;
            me.onStore('general.GradosStore');
            me.onStore('admin.DirGrupoStore');
        this.redirectTo('groupmanagers', true);
    },

    onCreateAdmin : function (btn) {
        this.redirectTo('admins', true);
    },

    onCreateTeachers : function (btn) {
        this.redirectTo('teachers', true);
    },

    onCreateSchoolHeadquarters : function (btn) {
        this.redirectTo('schoolheadquarters', true);
    },

    onCreateSchool : function (btn) {
       this.redirectTo('schoolinformation', true);
    },
    onSetReport: function(btn){
        var url     = 'reports/report_dir_grupos',
            win     = btn.up('window'),
            param   = {

            };
        this.onGenReport(btn,url,param);
    }
});
