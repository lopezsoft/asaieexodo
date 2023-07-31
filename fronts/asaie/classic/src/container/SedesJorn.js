
Ext.define('Admin.container.SedesJorn',{
    extend	: 'Ext.container.Container',
    alias	: 'widget.sedesJorn',
    xtype	: 'sedesJorn',
    requires: [
        'Admin.combo.CbJornadas',
        'Admin.combo.CbSedes',
        'Admin.combo.CbGrados'
    ],
    items: [
        {
            xtype: 'CbSedes',
            listeners: {
                select: function (cb, r) {
					let me = Admin.getApplication(),
						param = {
							pdbTable: 'jornadas',
							pdbSede: r.id,
							...Global.getSchoolParams(),
						};

					me.setParamStore('JornadasStore', param, true);

                    param = {
                        pdbTable    : 'grados',
                        pdbSede     : r.id,
						...Global.getSchoolParams(),
                    };
                    me.setParamStore('GradosStore', param, true);
                }
            }
        },
        {
            xtype: 'CbJornadas',
            bind: {
                visible: '{comboSedes.value}'
            }
        },
        {
            xtype   : 'CbGrados',
            bind: {
                visible: '{comboJornadas.value}'
            }
        }
    ]
});
