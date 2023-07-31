Ext.define('Admin.view.academico.container.AcademicContainerView',{
    extend  : 'Ext.container.Container',
    controller  : 'academico',
    alias       : 'widget.academicContainerView',
    xtype       : 'academicContainerView',
    reference   : 'academicContainerView',
    layout      : 'responsivecolumn' ,
	initComponent: function () {
		const { isSecretary, isCoordinador } = AuthToken.profileSettings();
		this.items	= [
			{
				xtype   : 'containerButton',
				disabled: !isSecretary,
				hidden	: !isSecretary,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Inscripción y matriculas',
						iconCls : 'fas fa-user-graduate',
						handler : 'onViewIscripciones'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isSecretary,
				hidden	: isSecretary,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Áreas académicas',
						iconCls : 'x-fa fa-table',
						handler : 'onCreateAreas'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isSecretary,
				hidden	: isSecretary,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Asignaturas académicas',
						iconCls : 'x-fa fa-table',
						handler : 'onCreateAsignaturas'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isSecretary,
				hidden	: isSecretary,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Asignación académica',
						handler : 'onCreateCarga',
						iconCls: 'fas fa-chalkboard-teacher'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Notas reportadas',
						handler : 'onNotasReportadas',
						iconCls: 'fas fa-chalkboard-teacher'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isSecretary || isCoordinador,
				hidden	: isSecretary || isCoordinador,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Notas académicas',
						handler : 'onNotasAcademicas',
						iconCls: 'fas fa-chalkboard-teacher'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Transferir Notas académicas',
						handler : 'onTransferirNotasView',
						iconCls: 'fas fa-chalkboard-teacher'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: !isSecretary,
				hidden	: !isSecretary,
				items   : [
					{
						xtype: 'buttonPanel',
						text: 'Constancias de estudio',
						handler: 'onConstancias'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: !isSecretary,
				hidden	: !isSecretary,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Certificados periódicos',
						handler : 'onCertificados'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype: 'buttonPanel',
						text: 'Cuadro de honor',
						handler: 'onCuadroHonor'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: !isSecretary,
				hidden	: !isSecretary,
				items   : [
					{
						xtype: 'buttonPanel',
						text: 'Mover Estudiantes',
						handler: 'onMoverEstudiantes'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype: 'buttonPanel',
						text: 'Informes',
						iconCls : 'x-fa fa-print',
						handler : 'onViewReportes'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Ficha Observador',
						handler : 'onFichaObservador'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isSecretary,
				hidden	: isSecretary,
				disabled: true,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Acceso Estudiantes',
						iconCls : 'x-fa fa-key',
						tooltip : 'Permite restringir el acceso al personal estudiantil.',
						handler : function () {
							Ext.create('Admin.view.academico.inscripciones.StudentAccess').show();
						}
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isSecretary || isCoordinador,
				hidden	: isSecretary || isCoordinador,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Actividades de apoyo',
						iconCls : 'x-fa fa-cog',
						handler : 'onActividadesApoyo'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isSecretary,
				hidden	: isSecretary,
				disabled: true,
				items: [
					{
						xtype   : 'buttonPanel',
						text    : 'Mayúsculas Logros Indicadores',
						handler : 'onMayus',
						iconCls : 'x-fa fa-text-width'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Pre-Matricula Nuevos',
						iconCls : 'xi-student-24',
						disabled: true,
						handler : 'onViewPreMatNuevos'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Pre-Matricula Antiguos',
						iconCls : 'xi-student-24',
						disabled: true,
						handler : 'onViewPreMatViejos'
					}
				]
			}
		];
		this.callParent(arguments);
	}
});
