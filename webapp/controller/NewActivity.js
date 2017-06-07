sap.ui.define([
	"sap/ui/base/Object",
    
], function (UI5Object) {
	"use strict";

	return UI5Object.extend("fin.confin.con.groupshare.controller.NewActivity", {

		constructor : function (oView) {
			this._oView = oView;	
		},

		open : function () {
			var oView = this._oView;
			var oDialog = oView.byId("newActivity");
			
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "fin.confin.con.groupshare.view.Activity", this);
				// connect dialog to the root view of this component (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		onSave:function (oEvent){

			var oView = this._oView;
			var that = this;
			var oSelect = oView.byId("_fiscalYear"),
				oCu = oView.byId("_cu"),
				oIu = oView.byId("_iu"),
				oDi = oView.byId("_di"),
				oCm = oView.byId("_cm");

			$.ajax({

				  type:"POST", 
            		url:'/groupshare/odata.svc/InvestmentActivitys', 
					contentType:"application/json",
					data:JSON.stringify({
					// "PostDate":"/Date(1496636129655)/",
					// "ConsolidationUnitInvester":oCu.getValue(),
					// "ConsolidationUnitInvestee":oIu.getValue(),
					// "DirectInvestPercentage":oDi.getValue(),
					// "Comments":oCm.getValue()
					
					"PostDate":"/Date(1496636129655)/",
					"DirectInvestPercentage":oDi.getValue(),
					"Comments":oCm.getValue(),
						"ConsolidationUnitDetails":{
						"__deferred":{
							"uri":"ConsolidationUnits('C3C9E3B3-2C43-46A0-A726-D09313FC1835')"
						}
					},
						"ConsolidationUnitDetails1":{
						"__deferred":{
							"uri":"ConsolidationUnits('67B59B6C-F860-489A-B3AB-F6DF4E605BA7')"
						}
					}

					
			}),
				success:function(){
						console.log("success");
						that._oView.byId("newActivity").close();
				},
				error:function(err){
					console.log("error");
					console.log(err);
				}
			});
		},

		onCloseDialog : function () {
		 this._oView.byId("newActivity").close();
		}
	});

});