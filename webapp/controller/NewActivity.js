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
				oView.byId('newForm').setModel(oView.getModel(), 'NewActivity');
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

				function buildCURelation(key){
					return JSON.parse(`{"__deferred":{"uri":"ConsolidationUnits('${key}')"}}`);
				}
			$.ajax({type:"POST", 
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
						"ConsolidationUnitDetails":buildCURelation(oCu.getSelectedKey()),
						"ConsolidationUnitDetails1":buildCURelation(oIu.getSelectedKey()),
			}),
				success:function(){
					that._oView.byId('activityList').getModel().refresh();
					that.onCloseDialog();
				},
				error:function(err){
					console.error("error");
					console.error(err);
				}
			});
		},

		onCloseDialog : function () {

			var oView = this._oView,
				oModel = oView.getModel(),
			 	that = this,
			 	oSelect = oView.byId("_fiscalYear"),
				oCu = oView.byId("_cu"),
				oIu = oView.byId("_iu"),
				oDi = oView.byId("_di"),
				oCm = oView.byId("_cm");
			
		//   oCu.setSelectedKey(oModel.);
		  
		  this._oView.byId("newActivity").close();
		}
	});

});