/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { GObject, St, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'FT Lock Defeater');

        this._timeoutId = null;
        this._intervalSeconds = 60;

        // Set default icon
        this._icon = new St.Icon({
            icon_name: 'view-conceal-symbolic.symbolic.png',
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        // Create a native toggle switch in the dropdown menu
        this._switchItem = new PopupMenu.PopupSwitchMenuItem('Prevent Screen Lock', false);
        
        // Listen to the switch state changes
        this._switchItem.connect('toggled', (item, state) => {
            this._toggleWakelock(state);
        });
        
        this.menu.addMenuItem(this._switchItem);
    }

    _toggleWakelock(state) {
        if (state) {
            // Extension is ON
            this._icon.icon_name = 'view-reveal-symbolic.symbolic.png';
            
            // Trigger immediately the first time
            this._simulateActivity();
            
            // Start the background loop
            this._timeoutId = GLib.timeout_add_seconds(
                GLib.PRIORITY_DEFAULT,
                this._intervalSeconds,
                () => {
                    this._simulateActivity();
                    return true; // Keep the timer running
                }
            );
        } else {
            // Extension is OFF
            this._icon.icon_name = 'view-conceal-symbolic.symbolic.png';
            this._stopTimer();
        }
    }

    _simulateActivity() {
        try {
            // Execute xdotool in the background
            GLib.spawn_command_line_async('xdotool key Shift_L');
        } catch (e) {
            log('FT Lock Defeater Error: Failed to execute xdotool - ' + e);
        }
    }

    _stopTimer() {
        if (this._timeoutId !== null) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    destroy() {
        // Clean up the timer when extension is disabled
        this._stopTimer();
        super.destroy();
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
