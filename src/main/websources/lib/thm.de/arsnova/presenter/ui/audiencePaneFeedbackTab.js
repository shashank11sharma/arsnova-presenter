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
		"dojo/dom",
		"dojo/dom-construct",
		"dijit/registry",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/MenuItem",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/chart/audienceFeedback",
		"dojo/i18n",
		"dojo/i18n!./nls/audience",
		"dojo/i18n!./nls/audienceFeedback"
	],
	function (dom, domConstruct, registry, ContentPane, MenuItem, fullScreen, audienceFeedbackChart, i18n) {
		"use strict";

		var
			self = null,
			model = null,
			messages = null,
			feedbackMessages = null,

			/* Dijit */
			pane = null
		;

		self = {
			/* public "methods" */
			init: function (tabContainer, feedbackModel) {
				model = feedbackModel;

				messages = i18n.getLocalization("arsnova-presenter/ui", "audience");
				feedbackMessages = i18n.getLocalization("arsnova-presenter/ui", "audienceFeedback");

				pane = new ContentPane({
					id: "audienceFeedbackPane",
					title: feedbackMessages.liveFeedback
				});
				tabContainer.addChild(pane);
			},

			startup: function () {
				var feedbackPaneContentNode = domConstruct.create("div", {id: "audienceFeedbackPaneContent"}, pane.domNode);
				audienceFeedbackChart.init(feedbackPaneContentNode);

				model.onReceive(function (feedback) {
					var feedback0 = feedback[0];
					feedback[0] = feedback[1];
					feedback[1] = feedback0;
					self.update(feedback);
				});

				/* add full screen menu items */
				var fullScreenMenu = registry.byId("fullScreenMenu");
				fullScreenMenu.addChild(new MenuItem({
					label: feedbackMessages.audienceFeedback,
					onClick: self.toggleFullScreenMode
				}));

				/* handle events fired when full screen mode is canceled */
				fullScreen.onChange(function (event, isActive) {
					if (!isActive) {
						self.exitFullScreenMode();

						pane.resize();
					}
				});
			},

			update: function (feedback) {
				audienceFeedbackChart.update(feedback);
			},

			toggleFullScreenMode: function () {
				if (fullScreen.isActive()) {
					/* dom node rearrangement takes place in fullscreenchange event handler */
					fullScreen.exit();
				} else {
					fullScreen.request(dom.byId("fullScreenContainer"));
					domConstruct.create("header", {id: "audienceFeedbackTitle", innerHTML: "Audience feedback"}, "fullScreenHeader");
					domConstruct.place(dom.byId("audienceFeedbackPaneContent"), "fullScreenContent");

					registry.byId("fullScreenContainer").resize();
				}
			},

			exitFullScreenMode: function () {
				domConstruct.place(dom.byId("audienceFeedbackPaneContent"), pane.domNode);
				domConstruct.destroy("audienceFeedbackTitle");
			}
		};

		return self;
	}
);
