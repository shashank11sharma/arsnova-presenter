/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 * 
 * This file is part of ARSnova Presenter.
 * 
 * Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/string",
		"dojo/on",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/dom-style",
		"dijit/form/Button",
		"dijit/form/ValidationTextBox",
		"dijit/Dialog"
	],
	function(string, on, domConstruct, domClass, domStyle, Button, ValidationTextBox, Dialog) {
		"use strict";
		
		var
			self = null,
			interval = null,
			warningThresholdSeconds = 0,
			remainingSeconds = 0.0,
			
			/* DOM */
			timerNode = null,
			remainingTimeNode = null,
			
			/* Dijit */
			dialog = null,
			intervalTextBox = null
		;
		
		self = {
			showSettings: function(defaultInterval) {
				if (null == dialog) {
					if (null == defaultInterval) {
						defaultInterval = "10:00";
					}
					var contentNode = domConstruct.create("div");
					(intervalTextBox = new ValidationTextBox({
						value: defaultInterval,
						required: true,
						/* allow time intervals following the pattern
						 * [h]h:mm:ss, [m]m:ss with h < 24, m < 60, s < 60 */
						pattern: "(((2[0-3]|[01]?[0-9]):)?[0-5])?[0-9]:[0-5][0-9]",
						placeHolder: "mm:ss",
						style: "width: 5em;"
					})).placeAt(contentNode).startup();
					new Button({
						label: "Start",
						onClick: function() {
							if (intervalTextBox.isValid()) {
								var timeComponents = intervalTextBox.get("value").split(":");
								if (timeComponents.length < 3) {
									/* add array element for hours */
									timeComponents.unshift(0);
								}
								var intervalSeconds = timeComponents[0] * 3600
									+ timeComponents[1] * 60
									/* multiplication with 1 converts string into int
									 * to prevent string concatenation */
									+ timeComponents[2] * 1
								;
								self.start(intervalSeconds);
								dialog.hide();
							}
						}
					}).placeAt(contentNode).startup();
					new Button({
						label: "Stop",
						onClick: self.stop
					}).placeAt(contentNode).startup();
					dialog = new Dialog({
						title: "Timer",
						content: contentNode
					});
				}
				dialog.show();
			},
			
			start: function(intervalSeconds) {
				if (null != interval) {
					clearInterval(interval);
				}
				
				if (null == timerNode) {
					timerNode = domConstruct.create("div", {id: "timerUnderlay"}, document.body);
					var timerWrapper = domConstruct.create("div", null, timerNode);
					remainingTimeNode = domConstruct.create("div", {id: "remainingTime"}, timerWrapper);
					on(timerNode, "click", function() {
						if (remainingSeconds < 1.0) {
							self.stop();
						} else {
							dialog.show();
						}
					});
				}
				domClass.remove(remainingTimeNode, "highlight");
				domStyle.set(timerNode, "display", "");
				
				remainingSeconds = intervalSeconds;
				warningThresholdSeconds = remainingSeconds > 180 ? 60 : (remainingSeconds > 60 ? 30 : 10);
				interval = setInterval(countDown, 500);
				countDown();
			},
			
			stop: function() {
				if (null != interval) {
					clearInterval(interval);
				}
				domStyle.set(timerNode, "display", "none");
			}
		};
		
		/* private "methods" */
		var countDown = function() {
			remainingSeconds -= 0.5;
			
			if (remainingSeconds <= warningThresholdSeconds) {
				domClass.toggle(remainingTimeNode, "highlight");
				
				if (remainingSeconds < 0.5) {
					return;
				}
			}
			
			var hours = Math.floor(remainingSeconds / 3600.0);
			var minutes = Math.floor(remainingSeconds / 60.0) % 60;
			var seconds = Math.floor(remainingSeconds % 60);
			
			var remainingTimeString = (hours > 0 ? hours + ":" + string.pad(minutes, 2) : minutes)
				+ ":" + string.pad(seconds, 2)
			;
			remainingTimeNode.innerHTML = remainingTimeString;
		};
		
		return self;
	}
);
