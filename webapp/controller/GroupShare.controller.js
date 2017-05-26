sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("fin.confin.con.groupshare.controller.GroupShare", {
		onInit:function(){

			var aFiscalYear =  {	data:[ {  key:'2017.001',value:'2017.001'  },
										{  key:'2017.002',value:'2017.002'  },
										{  key:'2017.003',value:'2017.003'  },
										{  key:'2017.004',value:'2017.004'  },
										{  key:'2017.005',value:'2017.005'  },
										{  key:'2017.006',value:'2017.006'  }
								]};

			  var oFiscalModel = new JSONModel(aFiscalYear);
			  this.getView().setModel(oFiscalModel,"fiscalYear");

			 var oTable = this.getView().byId('activityList');
			//  var oDefaultModel = this.getModel();
			oTable.bindRows({path:'/InvestmentActivitys'});

			
		},

		onSearch:function(event){


			var oTable = this.byId("activityList");
			// oTable.getBinding("groupshare>/InvestmentActivitys").filter([]);

		},
		onBefore:function(oEvent){

			oEvent.getParameter('bindingParams').parameters.select = "*"

		}
		// onBeforeRebind:function(oEvent){


 
		// }
	});
});