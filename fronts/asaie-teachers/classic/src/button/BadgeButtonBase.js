/**
 * Created by LOPEZSOFT2 on 13/04/2017.
 */
Ext.define('Admin.button.BadgeButtonBase', {
    extend  : 'Admin.button.CustomButton',
    alias   : 'widget.badgebuttonbase',
    config: {
        badgeText   : '',
        badgeCls    : ''
    },
    renderTpl: [
        '<span id="{id}-btnWrap" data-ref="btnWrap" role="presentation" unselectable="on" style="{btnWrapStyle}" ' +
                'class="{btnWrapCls} {btnWrapCls}-{ui} {splitCls}{childElCls}">' +
            '<span id="{id}-btnEl" data-ref="btnEl" role="presentation" unselectable="on" style="{btnElStyle}" ' +
                    'class="{btnCls} {btnCls}-{ui} {textCls} {noTextCls} {hasIconCls} ' +
                    '{iconAlignCls} {textAlignCls} {btnElAutoHeightCls}{childElCls}">' +
                '<tpl if="iconBeforeText">{[values.$comp.renderIcon(values)]}</tpl>' +
                '<span id="{id}-btnInnerEl" data-ref="btnInnerEl" unselectable="on" ' +
                    'class="{innerCls} {innerCls}-{ui}{childElCls}">{text}</span>' +
                '<tpl if="!iconBeforeText">{[values.$comp.renderIcon(values)]}</tpl>' +
            '</span>' +
            '<tpl if="badgeText">'+
                '<span id="{id}-btnBadgeEl" data-ref="btnBadgeEl" unselectable="on" class="{badgeCls}">{badgeText}</span>'+
            '</tpl>'+
        '</span>' +

       // '{[values.$comp.getAfterMarkup ? values.$comp.getAfterMarkup(values) : ""]}' +
        // if "closable" (tab) add a close element icon
        '<tpl if="closable">' +
            '<span id="{id}-closeEl" data-ref="closeEl" class="{baseCls}-close-btn">' +
                '<tpl if="closeText">' +
                    ' {closeText}' +
                '</tpl>' +
            '</span>' +
        '</tpl>' +
        // Split buttons have additional tab stop for the arrow element
        '<tpl if="split">' +
            '<span id="{id}-arrowEl" class="{arrowElCls}" data-ref="arrowEl" ' +
                'role="button" hidefocus="on" unselectable="on"' +
                '<tpl if="tabIndex != null"> tabindex="{tabIndex}"</tpl>' +
                '<tpl foreach="arrowElAttributes"> {$}="{.}"</tpl>' +
                ' style="{arrowElStyle}"' +
            '>{arrowElText}</span>' +
        '</tpl>'
    ],
    iconTpl:[
        '<span id="{id}-btnIconEl" data-ref="btnIconEl" role="presentation" unselectable="on" class="{baseIconCls} ' +
            '{baseIconCls}-{ui} {iconCls} {glyphCls}{childElCls}" style="' +
            '<tpl if="iconUrl">background-image:url({iconUrl});</tpl>' +
            '<tpl if="glyph">' +
                '<tpl if="glyphFontFamily">' +
                'font-family:{glyphFontFamily};' +
                '</tpl>' +
            '">{glyph}' +
            '<tpl else>' +
                '">' +
            '</tpl>' +
        '</span>'
    ],
    childEls: ["btnBadgeEl"],
    initComponent: function (config) {
        Ext.apply(this.config, config);
        this.callParent(arguments);
        /**
         * @event badgetextchange
         * Fired when the button's badge text is changed by the {@link #setBadgeText} method.
         * @param {Ext.ux.container.BadgeButton} this
         * @param {String} oldText
         * @param {String} newText*/

        this.on("badgetextchange", function (me, oldBadgeText, text) {
        });

        /**
         * @event badgeclschange
         */
        this.on('badgeclschange', function(me, oldCls, cls) {

        });
    },
    getTemplateArgs: function () {
        var me = this,
            btnCls      = me._btnCls,
            baseIconCls = me._baseIconCls,
            iconAlign   = me.getIconAlign(),
            glyph       = me.glyph,
            glyphFontFamily,
            text        = me.text,
            hasIcon     = me._hasIcon(),
            hasIconCls  = me._hasIconCls;

        // Transform Glyph to the useful parts
        if (glyph) {
            glyphFontFamily = glyph.fontFamily;
            glyph           = glyph.character;
        };
        cfg = {
            split       : me.isSplitButton,
            innerCls    : me._innerCls,
            splitCls    : me.getArrowVisible() ? me.getSplitCls() : '',
            iconUrl     : me.icon,
            iconCls     : me.iconCls,
            glyph       : glyph,
            glyphCls    : glyph ? me._glyphCls : '',
            glyphFontFamily : glyphFontFamily,
            text        : text || '&#160;',
            badgeText   : me.badgeText || '&#160;',
            badgeCls    : me.badgeCls  || '',
            closeText   : me.closeText,
            textCls     : text ? me._textCls : '',
            noTextCls   : text ? '' : me._noTextCls,
            hasIconCls  : hasIcon ? hasIconCls : '',
            btnWrapCls  : me._btnWrapCls,
            btnWrapStyle: me.width ? 'table-layout:fixed;' : '',
            btnElStyle  : me.height ? 'height:auto;' : '',
            btnCls      : btnCls,
            baseIconCls : baseIconCls,
            iconBeforeText  : iconAlign === 'left' || iconAlign === 'top',
            iconAlignCls    : hasIcon ? (hasIconCls + '-' + iconAlign) : '',
            textAlignCls    : btnCls + '-' + me.getTextAlign(),
            arrowElCls      : me._arrowElCls,
            arrowElStyle    : me.arrowVisible ? '' : 'display:none',
            tabIndex        : me.tabIndex
        };
        return cfg;
    },

    /**
     * Sets this Button's Badge CssClaass
     * @param cls
     */
    setBadgeCls : function (cls) {
        cls = cls || '';
        var me = this,
            oldCls      = me.badgeCls || '',
            btnBadgeEl  = me.btnBadgeEl;
        if (cls != oldCls) {
            me.badgeCls =  cls;
            if (me.rendered) {
                btnBadgeEl['removeCls'](oldCls);
                btnBadgeEl[me.badgeText ? 'addCls' : 'removeCls'](me.badgeCls);
                if (Ext.isStrict && Ext.isIE8) {
                    // weird repaint issue causes it to not resize
                    me.el.repaint();
                }
                me.updateLayout();
            }
            me.fireEvent('badgeclschange', me, oldCls, cls);
        }
        return me;
    },

    /**
     * Sets this Button's Badge text
     * @param {String} text The button badge text
     * @return {Ext.ux.container.BadgeButton} this
     */
    setBadgeText: function (text) {
        text = text || '';
        var me = this,
            oldBadgeText = me.badgeText || '',
            btnBadgeEl  = me.btnBadgeEl;
        if (text != oldBadgeText) {
            me.badgeText = text;
            if (me.rendered) {
                tp  = me.lookupTpl('renderTpl');
                tp.overwrite(btnBadgeEl,{badgeText : text});
                if (Ext.isStrict && Ext.isIE8) {
                    // weird repaint issue causes it to not resize
                    me.el.repaint();
                }
                me.updateLayout();
            }
            me.fireEvent('badgetextchange', me, oldBadgeText, text);
        }
        return me;
    }
});