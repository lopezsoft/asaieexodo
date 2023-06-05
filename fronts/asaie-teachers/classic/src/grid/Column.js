/**
 * Created by LOPEZSOFT2 on 19/04/2017.
 */

Ext.define('Admin.grid.Column', {
    extend: 'Ext.grid.column.Column',
    alternateClassName: ['Admin.grid.column'],
    alias: 'widget.Column',

    /**
     * @property {Boolean} isCheckColumn
     * `true` in this class to identify an object as an instantiated Check column, or subclass thereof.
     */
    isCheckColumn: true,

    config: {
        /**
         * @cfg {Boolean} [headerCheckbox=false]
         * Configure as `true` to display a checkbox below the header text.
         *
         * Clicking the checkbox will check/uncheck all records.
         */
        headerCheckbox: false
    },

    /**
     * @cfg
     * @hide
     * Overridden from base class. Must center to line up with editor.
     */
    align: 'center',

    /**
     * @cfg {String} [triggerEvent=click]
     * The mouse event which triggers the toggle of a single cell.
     */
    triggerEvent: 'click',

    /**
     * @cfg {Boolean} invert
     * Use `true` to display a check when the value is `false` instead of when the value
     * is `true`.
     */
    invert: false,

    /**
     * @cfg {String} tooltip
     * The tooltip text to show upon hover of a checked cell.
     */

    /**
     * @cfg {String} checkedTooltip
     * The tooltip text to show upon hover of an unchecked cell.
     */

    ignoreExport: true,

    /**
     * @cfg {Boolean} [stopSelection=true]
     * Prevent grid selection upon mousedown.
     */
    stopSelection: true,

    /**
     * @private
     */
    headerCheckedCls: Ext.baseCSSPrefix + 'grid-hd-checker-on',

    /**
     * @private
     * The CSS class used to style and select the header checkbox.
     */
    headerCheckboxCls: Ext.baseCSSPrefix + 'column-header-checkbox',

    checkboxCls: Ext.baseCSSPrefix + 'grid-checkcolumn',

    checkboxCheckedCls: Ext.baseCSSPrefix + 'grid-checkcolumn-checked',

    innerCls: Ext.baseCSSPrefix + 'grid-checkcolumn-cell-inner',

    clickTargetName: 'el',

    defaultFilterType: 'boolean',

    checkboxAriaRole: 'button',

    /**
     * @event beforecheckchange
     * Fires when the UI requests a change of check status.
     * The change may be vetoed by returning `false` from a listener.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Number} rowIndex The row index.
     * @param {Boolean} checked `true` if the box is to be checked.
     * @param {Ext.data.Model} record The record to be updated.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     * @param {Ext.grid.CellContext} e.position A {@link Ext.grid.CellContext CellContext} object
     * containing all contextual information about where the event was triggered.
     */

    /**
     * @event checkchange
     * Fires when the UI has successfully changed the checked state of a row.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Number} rowIndex The row index.
     * @param {Boolean} checked `true` if the box is now checked.
     * @param {Ext.data.Model} record The record which was updated.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     * @param {Ext.grid.CellContext} e.position A {@link Ext.grid.CellContext CellContext} object
     */

    /**
     * @event beforeheadercheckchange
     * Fires when the header is clicked and before the mass check/uncheck takes place.
     * The change may be vetoed by returning `false` from a listener.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Boolean} checked `true` if all boxes are to be checked.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     */

    /**
     * @event headercheckchange
     * Fires after the header is clicked and a mass check/uncheck operation has been completed.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Boolean} checked `true` if all boxes are now checked.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     */

    constructor: function(config) {
        // This method may be invoked more than once in an event, so defer its actual invocation.
        // For example it's invoked in the renderer and updater and they may be called from a loop.
        this.updateHeaderState = Ext.Function.createAnimationFrame(config.updateHeaderState || this.updateHeaderState);

        this.scope = this;
        this.callParent(arguments);
    },

    afterComponentLayout: function() {
        var me = this;

        me.callParent(arguments);

        if (me.useAriaElements && me.headerCheckbox) {
            me.updateHeaderAriaDescription(me.areAllChecked());
        }

        // Only do this once
        if (!me.storeListeners) {
            // Ensure initial rendered state is correct.
            // This will update the header state on the next animation frame
            // after all rows have been rendered.
            me.updateHeaderState();

            // We need to listen to data changed. This includes add and remove as well as reload.
            // We cannot rely on the renderer or updater to kick off an updateHeaderState call
            // because buffered rendering may mean that the UI does not process the entire dataset.
            me.storeListeners = me.getView().dataSource.on({
                datachanged: me.onDataChanged,
                scope: me,
                destroyable: true
            });
        }
    },

    onRemoved: function() {
        this.callParent(arguments);
        this.storeListeners = Ext.destroy(this.storeListeners);
    },

    onDataChanged: function(store, records) {
        // If any records are added or removed, we need up to date the header state.
        this.updateHeaderState();
    },

    updateHeaderCheckbox: function(headerCheckbox) {
        var me = this,
            cls = Ext.baseCSSPrefix + 'column-header-checkbox';

        if (headerCheckbox) {
            me.addCls(cls);

            // So that SPACE/ENTER does not sort, but routes to the checkbox
            me.sortable = false;

            if (me.useAriaElements) {
                me.updateHeaderAriaDescription(me.areAllChecked());
            }
        }
        else {
            me.removeCls(cls);

            if (me.useAriaElements && me.ariaEl.dom) {
                me.ariaEl.dom.removeAttribute('aria-describedby');
            }
        }

        // Keep the header checkbox up to date
        me.updateHeaderState();
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        var me = this,
            key = type === 'keydown' && e.getKey(),
            isClick = type === me.triggerEvent,
            disabled = me.disabled,
            ret,
            checked;

        // Flag event to tell SelectionModel not to process it.
        e.stopSelection = !key && me.stopSelection;

        if (!disabled && (isClick || (key === e.ENTER || key === e.SPACE))) {
            checked = !me.isRecordChecked(record);

            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, checked, record, e) !== false) {

                me.setRecordCheck(record, recordIndex, checked, cell, e);

                // Do not allow focus to follow from this mousedown unless the grid is already in actionable mode
                if (isClick && !view.actionableMode) {
                    e.preventDefault();
                }
                if (me.hasListeners.checkchange) {
                    me.fireEvent('checkchange', me, recordIndex, checked, record, e);
                }
            }
        } else {
            ret = me.callParent(arguments);
        }
        return ret;
    },

    onTitleElClick: function(e, t, sortOnClick) {
        var me = this;

        // Toggle if no text, or it's activated by SPACE key, or the click is on the checkbox element.
        if (!me.disabled && (e.keyCode || !me.text || (Ext.fly(e.target).hasCls(me.headerCheckboxCls)))) {
            me.toggleAll(e);
        } else {
            return me.callParent([e, t, sortOnClick]);
        }
    },

    toggleAll: function(e) {
        var me = this,
            view = me.getView(),
            store = view.getStore(),
            checked = !me.allChecked,
            position, text, anncEl;

        if (me.fireEvent('beforeheadercheckchange', me, checked, e) !== false) {

            // Only create and maintain a CellContext if there are consumers
            // in the form of event listeners. The event is a click on a
            // column header and will have no position property.
            if (me.hasListeners.checkchange || me.hasListeners.beforecheckchange) {
                position = e.position = new Ext.grid.CellContext(view);
            }
            store.each(function(record, recordIndex) {
                me.setRecordCheck(record, recordIndex, checked, view.getCell(record, me));
            });

            me.setHeaderStatus(checked, e);
            me.fireEvent('headercheckchange', me, checked, e);
        }
    },

    setHeaderStatus: function(checked, e) {
        var me = this;

        // Will fire initially due to allChecked being undefined and using !==
        if (me.allChecked !== checked) {
            me.allChecked = checked;

            if (me.headerCheckbox) {
                me[checked ? 'addCls' : 'removeCls'](me.headerCheckedCls);

                if (me.useAriaElements) {
                    me.updateHeaderAriaDescription(checked);
                }
            }
        }
    },

    updateHeaderState: function(e) {
        // This is called on a timer, so ignore if it fires after destruction
        if (!this.destroyed && this.headerCheckbox) {
            this.setHeaderStatus(this.areAllChecked(), e);
        }
    },

    /**
     * Enables this CheckColumn.
     */
    onEnable: function() {
        this.callParent(arguments);
        this._setDisabled(false);
    },

    /**
     * Disables this CheckColumn.
     */
    onDisable: function() {
        this._setDisabled(true);
    },

    // Don't want to conflict with the Component method
    _setDisabled: function(disabled) {
        var me = this,
            cls = me.disabledCls,
            items;

        items = me.up('tablepanel').el.select(me.getCellSelector());
        if (disabled) {
            items.addCls(cls);
        } else {
            items.removeCls(cls);
        }
    },

    defaultRenderer: function(value, cellValues) {
        var me = this,
            cls = me.checkboxCls,
            tip = me.tooltip;

        if (me.invert) {
            value = !value;
        }
        if (me.disabled) {
            cellValues.tdCls += ' ' + me.disabledCls;
        }

        if (value) {
            cls += ' ' + me.checkboxCheckedCls;
            tip = me.checkedTooltip || tip;
        }

        if (me.useAriaElements) {
            cellValues.tdAttr += ' aria-describedby="' + me.id + '-cell-description' +
                (!value ? '-not' : '') + '-selected"';
        }

        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();

        return '<span ' + (tip || '') + ' class="' + cls + '" role="' + me.checkboxAriaRole + '"' +
            (!me.ariaStaticRoles[me.checkboxAriaRole] ? ' tabIndex="0"' : '') +
            '></span>';
    },

    isRecordChecked: function (record) {
        var prop = this.property;
        if (prop) {
            return record[prop];
        }
        return record.get(this.dataIndex);
    },

    areAllChecked: function() {
        var me = this,
            store = me.getView().getStore(),
            records, len, i;

        if (!store.isBufferedStore && store.getCount() > 0) {
            records = store.getData().items;
            len = records.length;
            for (i = 0; i < len; ++i) {
                if (!me.isRecordChecked(records[i])) {
                    return false;
                }
            }
            return true;
        }
    },

    setRecordCheck: function (record, recordIndex, checked, cell) {
        var me = this,
            prop = me.property,
            result;

        // Only proceed if we NEED to change
        if (prop ? record[prop] : record.get(me.dataIndex) != checked) {
            if (prop) {
                record[prop] = checked;
                me.updater(cell, checked);
            } else {
                record.set(me.dataIndex, checked);
            }
        }
    },

    updater: function (cell, value) {
        var me = this,
            tip = me.tooltip;

        if (me.invert) {
            value = !value;
        }
        if (value) {
            tip = me.checkedTooltip || tip;
        }
        if (tip) {
            cell.setAttribute('data-qtip', tip);
        } else {
            cell.removeAttribute('data-qtip');
        }
        cell = Ext.fly(cell);


        cell[me.disabled ? 'addCls' : 'removeCls'](me.disabledCls);
        Ext.fly(cell.down(me.getView().innerSelector, true).firstChild)[value ? 'addCls' : 'removeCls'](Ext.baseCSSPrefix + 'grid-checkcolumn-checked');

        // This will update the header state on the next animation frame
        // after all rows have been updated.
        me.updateHeaderState();
    }
});