Ext.define('Admin.view.admin.SchoolHeadquarters',{
    extend  : 'Admin.forms.CustomForm',
    alias   : 'widget.schoolheadquarters',
	showSaveButton 	: false,
    controller 		: 'admin',
	initComponent : function(){
		let me	= this,
			app	= Admin.getApplication();
		app.onStore('general.SedesStore');	
		app.onStore('general.CitiesStore');
		app.onStore('general.PoblacionatendidaStore');
		app.onStore('general.ZonaStore');
		app.onStore('general.ADesicionStore');
		me.setTitle(AppLang.getSTitleViewVanues());
		me.callParent(arguments);
	},
	modalView	: 'Admin.view.admin.forms.SaveSchoolHeadquarters',
    items   : [{
        xtype       : 'customgrid',
		plugins		: [
			{
				ptype			: 'gridSearch',
				readonlyIndexes	: ['note'],
				disableIndexes	: ['pctChange'],
				mode            : 'local',
				flex			: 1,
				autoFocus		: false,
				independent		: true
			}
		],
        store       : 'SedesStore',
        columns     : [
            {
                xtype   : 'rownumberer'
            },
            {
                text        : 'Nombre de la sede',
                dataIndex   : 'NOMBRE_SEDE',
                width       : 350
            },
            {
                text        : 'Dirección',
                dataIndex   : 'DIRECCION_SEDE',
                width       : 200
            },
			{
				text        : 'Teléfonos',
				dataIndex   : 'TELEFONOS_SEDE',
				width       : 100
			}
        ],
        dockedItems : [
            {
                xtype   : 'toolbarCrud',
                items   : [
					'->',
					{
						xtype	: 'customButton',
						itemId	: 'btnJornSede',
						iconCls	: 'x-fa fa-plus',
						text	: AppLang.getSButtonStudyDay(),
						disabled	: true,
						handler	: function (btn) {
							var
								me = Admin.getApplication(),
								sel = btn.up('form').down('grid').getSelection()[0];
							param = {
								sede: sel.id,
								pdbTable: 'jornadas_sedes'
							};
							me.onStore('admin.JornSedesStore');
							me.setParamStore('JornSedesStore',param);
							Ext.create('Admin.view.admin.JornSedesView').show();
						}
					},'-',
					{
						xtype	: 'customButton',
						itemId	: 'btnNivSede',
						iconCls	: 'x-fa fa-plus',
						disabled	: true,
						text	: AppLang.getSButtonStudyLevels(),
						handler	: function (btn) {
							var
								me = Admin.getApplication(),
								sel = btn.up('form').down('grid').getSelection()[0];
							param = {
								sede: sel.id,
								pdbTable: 'niveles_sedes'
							};
							me.onStore('admin.NivelesSedesStore');
							me.setParamStore('NivelesSedesStore',param);
							Ext.create('Admin.view.admin.NivelesSedesView').show();
						}
					},'-',
                    {
						xtype	: 'addButton'
					},'-',
					{
						xtype	: 'editButton'
					},'-',
					{
						xtype	: 'deletebutton'
					},
					{
						xtype 	: 'closebutton'
					}
                ]
            },
            {
                xtype 		: 'pagination'
            }
        ]
    }]
});
