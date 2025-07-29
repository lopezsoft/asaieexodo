Ext.define('Admin.view.docentes.observador.FichaSeguimientoForm' ,{
    extend		: 'Admin.forms.CustomForm',
    alias 		: 'widget.fichaseguimientodocente',
	xtype		: 'fichaseguimientodocente',
	controller	: 'observador',
	requires	: [
		'Admin.combo.CbCargaDocente'
	],
	initComponent : function (){
		const me = Admin.getApplication();
		me.onStore('docentes.CargaAgrupadaObservadorStore');
		me.onStore('docentes.EstudiantesStore');
		me.onStore('docentes.observador.ObservadorStore');
		me.onStore('docentes.observador.DesicionStore');
		me.onStore('docentes.observador.SituacionStore');
		me.onStore('docentes.observador.DiscalculiaStore');
		me.onStore('docentes.observador.DislexiaStore');
		me.onStore('docentes.observador.ItemsModelo3Store');
		me.onStore('docentes.observador.DisortografiaStore');
		me.onStore('general.DocumentosStore');
		me.onStore('general.CountryStore');
		me.onStore('general.CitiesStore');
		me.onStore('general.CitiesStore2');
		me.onStore('general.CitiesStore3');
		me.onStore('general.PoblacionatendidaStore');
		me.onStore('general.RHStore');
		me.onStore('general.EstratoStore');
		me.onStore('general.ZonaStore');
		me.onStore('general.SedesStore');
		me.onStore('general.GradosStore');
		me.onStore('general.GrupoStore');
		me.onStore('general.JornadasStore');
		me.onStore('general.EstadoStore');
		me.onStore('inscripciones.MatriculasStore');
		me.onStore('inscripciones.InscripcionesStore');
		me.onStore('inscripciones.ExtraInscripcionesStore');
		me.onStore('inscripciones.FamiliesStudentStore');
		me.onStore('inscripciones.HistorialStore');
		this.setTitle('Listado de estudiantes - ' + Global.getYear());
		this.callParent(arguments);
	},
    items : [
    	{
			xtype   	: 'customgrid',
			autoLoad	: false,
			selModel	: 'rowmodel',
			store		: 'EstudiantesStore',
			plugins		: [
				{
					 ptype : 'gridfilters'
				},
				{
					ptype : 'responsive'
				},
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
		    columns: [
		    	{
					xtype	: 'rownumberer'	
				},
		        {
		            text    	: "Apellidos y nombres",
					width		: 300,
		            sortable	: true,
		            dataIndex	: 'nombres',
		            filter		: 'string'
		        },
		        {
		            text		: "Grado",
					width		: 150,
		            sortable	: true,
		            dataIndex	: 'grado'
		        },
		        {
		            text		: "Grupo",
		            width		: 60,
		            sortable	: true,
		            dataIndex	: 'id_group'
		        },
		        {
		            text		: "Jornada",
		            width		: 120,
		            sortable	: true,
		            dataIndex	: 'jornada'
		        },
		        {
		            text		: "Sede",
					flex		: 2,
		            sortable	: true,
		            dataIndex	: 'sede'
		        },
		        {
		            text		: "Año",
		            width		: 60,
		            dataIndex	: 'year'
		        }, 
		        {
					text		: "Estado",
					width		: 150,
		            dataIndex	: 'estado'
				}
		    ],
		    listeners: {
			    'selectionchange': function(grid, selected) {
			        this.down('#btnObservador').setDisabled(!selected.length);
			    }
			},
		   dockedItems: [
				{
					xtype : 'customToolbar',
					items : [
						{
							xtype		: 'cbCargaDocente',
							labelAlign	: 'left',
							hideLabel	: true,
							listeners: {
								focusenter: function(t) {
									if (t.value) {
										t.expand();
									}
								},
								select: function(c, r, e) {
									const extra = {
										pdbGrado: r.get('id_grado'),
										pdbGrupo: r.get('grupo'),
										pdbSede: r.get('id_sede'),
										pdbJorn: r.get('id_jorn')
									};
									Admin.getApplication().setParamStore('EstudiantesStore', extra);
								}
							}
						},
						{
							xtype	: 'customButton',
							tooltip : 'Buscar',
							itemId	: 'btnSearch',
							iconCls	: 'x-fa fa-search',
							bind: {
								disabled: '{!cbcarga.value}'
							},
							handler: function() {
								const store = Ext.getStore('EstudiantesStore');
								store.reload();
							}
						},'-',
						{
							xtype 	: 'customButton',
							itemId	: 'btnObservador',
							text 	: 'Ver ficha de seguimiento',
							disabled: true,
							iconCls : 'x-fa fa-spinner',
							handler	: 'onClickCrudObservador'
						},
						{
							xtype       : 'customButton',
							tooltip     : 'Crear Familiares',
							text        : 'Crear Familiares',
							iconCls     : 'x-fa fa-users',
							handler     : function(btn) {
								const app = Admin.getApplication();
								const win = btn.up('form');
								const data = win.down('grid').getSelection()[0];
								app.setParamStore('FamiliesStore', {
									pdbTable        : 'families'
								},false);
								Ext.create('Admin.view.academico.inscripciones.Families',{
									record  : data
								}).show();
							}
						},
						{
							xtype       : 'customButton',
							tooltip     : 'Familiares asignados al estudiante',
							iconCls     : 'x-fa fa-users',
							text        : 'Familiares',
							itemId      : 'btnFamil',
							disabled  	: true,
							handler     : function(btn) {
								const me = Admin.getApplication(),
									dataGrid    = btn.up('form').down('grid').getSelection()[0];
								me.setParamStore('FamiliesStudentStore', {
									pdbTable        : 'aux_families_students',
									pdbIdStudent    :  dataGrid.get('id_student')
								},false);
								Ext.create('Admin.view.academico.inscripciones.FamiliesStudent',{
									record  : dataGrid
								}).show();
							}
						},
						{
							xtype	: 'closebutton'
						}						
					]
				},
				{
			        xtype 			: 'pagination',
			        store			: 'EstudiantesStore'
				}
			]
		}
	]
});
