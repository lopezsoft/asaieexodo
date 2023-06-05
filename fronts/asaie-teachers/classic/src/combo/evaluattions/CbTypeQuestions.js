var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'description'},
        { name : 'icon'}
    ],
    data : [
        {id: '1', icon: '<i class="fas fa-align-left"></i>',   description: 'General o abierta'},
        {id: '2', icon: '<i class="far fa-dot-circle"></i>',   description: 'Selección múltiple con única respuesta'},
        {id: '3', icon: '<i class="fas fa-check-square"></i>',   description: 'Selección múltiple con múltiple respuesta'},
        {id: '4', icon: '<i class="far fa-dot-circle"></i>',   description: 'FALSO/VERDADERO'}
    ]
});

Ext.define('Admin.combo.CbTypeQuestions',{
	extend	: 'Admin.combo.ComboExpand',
	alias		: 'widget.cbtypequestions',
	name		: 'type_question',
    displayField: 'description',
    emptyText 	: 'Seleccione el tipo de pregunta por favor...',
    valueField	: 'id',
    publishes   : 'value',
    store		: store,
    tpl: Ext.create('Ext.XTemplate',
        '<ul class="x-list-plain"><tpl for=".">',
            '<li role="option" class="x-boundlist-item"> {icon} {description}</li>',
        '</tpl></ul>'
    ),
    // template for the content inside text field
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{description}',
        '</tpl>'
    )
});
