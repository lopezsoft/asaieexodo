Ext.define('Admin.view.language.Es',{
	singleton : true,
	alternateClassName : ['AppLang', 'Lang'],
	config	: {
		/**
		 * Menú principal*/
		sMainMenu					: 'ASAIE Administrativo',
		sTeacherMenu				: 'ASAIE Docente',
		sStudentMenu				: 'ASAIE Estudiante',
		/**
		 * Titulos de las ventanas
		 */
			/**
			 * Menú administrativo
			 */
			sTitleViewSchool		: 'Establecimiento',
			sTitleViewVanues		: 'Sede',
			sTitleViewTeachers		: 'Docentes',
			sTitleViewAdmin			: 'Administrativos',
			sTitleViewGroupDirectors: 'Directores de Grupo',
			sTitleViewAddGroupDirectors	: 'Agregar Directores de Grupo',
			/**
			 * Menú academico
			 */
			sTitleViewStudents		: 'Estudiantes',
			sTitleViewEnrollment	: 'Matricula',
			sTitleViewFamilies		: 'Familiares',
			sTitleViewAreas			: 'Áreas académicas',
			sTitleViewSubjects		: 'Asignaturas académicas',
			sTitleViewCourses		: 'Asignación académica',
			sTitleViewAcademicNotes	: 'Notas académicas',
			sTitleViewReportedNotes	: 'Notas reportadas',
			sTitleViewStudyConstancy: 'Constancias de estudio',
			sTitleViewStudyCertificates	: 'Certificados de estudio',
			sTitleViewHonorRoll			: 'Cuadro de honor',
			sTitleViewMoveStudents		: 'Mover estudiantes',
			sTitleViewNovelty			: 'Novedades académicas',
			/***
			 * General
			*/
			sTitleViewStudyDay		: 'Jornadas de estudio',
			sTitleViewStudyLevels	: 'Niveles de estudio',
			sTitleViewProfile		: 'Perfil de usuario',
			sTitleStudentRegistered		: 'Estudiantes matriculados',
			sTitleStudentRetired		: 'Estudiantes retirados',
			sTitleTeachersRegistered	: 'Docentes registrados',
			sTitleSelectFile			: 'Seleccionar archivo',
			sTitleConsolidated			: 'Consolidados académicos',
			sTitleNewsletters			: 'Boletines académicos',
			sTitleStatistics			: 'Estadísticas',
			sTitlSstudentsPerDay		: 'Estudiantes por jornada',
			sTitleReports				: 'Reportes',
			sTitleRegistrationSheet		: 'Ficha de matricula',
			sTitleLists					: 'Listas',
			sTitleDatesOfBirth			: 'Fechas de nacimiento',
			sTitleObserver			    : 'Observador estudiantíl',
			sTitleLevelings				: 'Nivelaciones/Actividades de apoyo',
			sTitleUppercase				: 'Pasar a Mayúsculas',

		/**
		 * General */
		sTitleNewEdit				: 'Nuevo/Editar',
		sSpace						: ' ',
		/**
		 * Descripción de las etiquetas de los campos */

		/**
		 * Descripcción de los textos en botones*/
		sButtonEdit					: 'Editar',
		sButtonAdd					: 'Nuevo',
		sButtonDelete				: 'Borrar',
		sButtonClose				: 'Atras',
		sButtonStudyLevels			: 'Niveles de estudio',
		sButtonStudyDay				: 'Jornadas de estudio',
		sButtonAggregate			: 'Agergar',
		sButtonCloseSession			: 'Cerrar sesión',
		sButtonUserProfile			: 'Perfil',
		sButtonDownload				: 'Desacargar',
		sButtonPreview				: 'Vista previa',
		sButtonAcept				: 'Aceptar',
		sButtonApply				: 'Aplicar',
		sButtonSelectFile			: 'Seleccionar una archivo en el equipo',
		sButtonLoadFile				: 'Subir archivos',
		sButtonMyFiles				: 'Mis archivos',
		sButtonGenerate				: 'Generar/Actualizar',
		sButtonAddNotes				: 'Digitar notas',
		sButtonNovelty				: 'Novedades',
		sSeeList					: 'Ver lista',
		/***
		 * ToolTips
		 */
		sToolTipButtonEdit					: 'Haga Click para editar el registro seleccionado',
		sToolTipButtonAdd					: 'Haga Click para agregar un nuevo registro',
		sToolTipButtonDelete				: 'Haga Click para eliminar el registro seleccionado',
		sToolTipButtonClose					: 'Cerrar la ventana y volver a la anterior',
		sToolTipChangeYear					: 'Cambiar año lectivo.',
		sTootTipHelp						: 'Ayuda en linea',
		sToolTipUserProfile					: 'Perfil de usuario',
		sToolTipImageProfile				: 'Imagen de Perfil',
		sToolTipDigitalDocuments			: 'Documentos digitales',
		/**
		 * Mensages
		 */
		sDbChangeYear			: 'Se ha realizado el cambio de año satisfactoriamente.',
		sDbNotChangeYear		: 'No se ha podido realizar el cambio de año',
		sMsgLoading				: 'Cargando...',
		sSavingChanges			: 'Guardando cambios...',
		sChangesOk				: 'Se han guardado los cambios',
		sGenerating				: 'Procesando petición...',
		sInvalidLeveling		: 'El valor ingresado debe ser mayor o igual que la nota perdida.',
		sMsgGenrateAct			: 'Luego de generar el acta de las nivelaciones el docente no podrá modificar las notas desde la plantilla de notas. <br>Esto solo aplica a los estudiantes que esten en el rango de nivelaciones. <br>¿Desea continuar.? ',
		sMgsDoNotEditEnrollment: 'No se puede modificar el estado de la matricula.'
	},
	constructor : function(config){
		this.initConfig(this.config,config);
	}
});
