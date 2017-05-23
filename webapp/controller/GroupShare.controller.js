sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("fin.confin.con.groupshare.controller.GroupShare", {
		onInit:function(){

		},

		onSearch:function(event){

			console.log(event);
			var oTable = this.byId("activityList");
			oTable.getBinding("groupshare>/InvestmentActivitys").filter([]);

		},
		onBeforeRebind:function(oEvent){

			

		}
	});
});