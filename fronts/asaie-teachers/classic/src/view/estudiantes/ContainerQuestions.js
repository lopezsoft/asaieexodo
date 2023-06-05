Ext.define('Admin.view.estudiantes.ContainerQuestions', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.containerquestions',

    bodyPadding : 15,
    ui          : 'panel-white',
    layout      : 'card',
    cls         : 'wizardthree shadow',
    colorScheme : 'soft-green',
    viewModel: {
        type: 'wizardform'
    },
    defaults : {
        /*
         * Seek out the first enabled, focusable, empty textfield when the form is focused
         */
        defaultFocus: 'textfield:not([value]):focusable:not([disabled])',

        defaultButton : 'nextbutton'
    },
    config  : {
        tbarItems   : [],
        newItems    : []
    },

    initComponent: function() {
        let 
            me   = this;

        me.items = me.getNewItems();
        me.tbar = {
            reference       : 'progress',
            itemId          : 'progress',
            scrollable      : true,
            defaultButtonUI : 'wizard-' + this.colorScheme,
            cls             : 'wizardprogressbar',
            defaults: {
                disabled    : true,
                iconAlign   :'top'
            },
            layout: {
                pack: 'center'
            },
            items: me.getTbarItems()
        };

        me.bbar = {
            reference   : 'navigation-toolbar',
            itemId      : 'navigation-toolbar',
            margin      : 8,
            items: [
                '->',
                {
                    text        : 'Anterior',
                    ui          : this.colorScheme,
                    formBind    : true,
                    bind: {
                        disabled: '{atBeginning}'
                    },
                    listeners: {
                        click: 'onPreviousClick'
                    }
                },
                {
                    text        : 'Siguiente',
                    ui          : this.colorScheme,
                    formBind    : true,
                    reference   : 'nextbutton',
                    bind: {
                        disabled: '{atEnd}'
                    },
                    listeners   : {
                        click: 'onNextClick'
                    }
                }
            ]
        };

        me.callParent(arguments);
    }
});
