sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/m/Dialog',
	'sap/m/Button',
	'./NewActivity',
	'sap/m/Label'
], function (Controller, JSONModel, Dialog, Button, NewActivity, Label) {
	"use strict";

	return Controller.extend("fin.confin.con.groupshare.controller.GroupShare", {
		onInit: function () {
		
			var aFiscalYear = {
				data: [{ key: '2017.001', value: '2017.001' },
				{ key: '2017.002', value: '2017.002' },
				{ key: '2017.003', value: '2017.003' },
				{ key: '2017.004', value: '2017.004' },
				{ key: '2017.005', value: '2017.005' },
				{ key: '2017.006', value: '2017.006' }
				]
			};

			var that = this;
			var oFiscalModel = new JSONModel(aFiscalYear);
			this.getView().setModel(oFiscalModel, "fiscalYear");

			// var oTable = this.getView().byId('activityList');
			// oTable.bindRows({ path: '/InvestmentActivitys' });

			// var comp = this.getOwnerComponent();

			// this.__newDialog =  new NewActivity(this.getOwnerComponent().getRootControl());

					

		},

		onSearch: function (event) {


			var oTable = this.byId("activityList");
			// oTable.getBinding("groupshare>/InvestmentActivitys").filter([]);

		},
		onBefore: function (oEvent) {

			oEvent.getParameter('bindingParams').parameters.select = "*"

		},

		onOpenNew: function (oEvent) {
			var that = this;
			// if (!that.newDialog) {
			// 	that.newDialog = new Dialog({
			// 		title: 'New Activity',
			// 		content:"",
			// 		endButton: new Button({
			// 			text: 'Cancel',
			// 			press: function () {
			// 				that.newDialog.close();
			// 			}
			// 		}),
			// 		beginButton:new Button({
			// 			text: 'Save',
			// 			press: function () {
			// 				that.newDialog.close();
			// 			}
			// 		}),
			// 	});

			// 	//to get access to the global model
			// 	this.getView().addDependent(that.newDialog);
			// }

			if (!that.__newDialog) {
				that.__newDialog = new NewActivity(this.getView());
			}

			that.__newDialog.open();

		},

		onDelete: function (oEvent) {

			var oTable = this.getView().byId("activityList"),
				oBinding = oTable.getBinding(),
				aSelects = oTable.getSelectedIndices(),
				aBatchOps = [];

			var aItems = aSelects.map(function(inx){

				return  oBinding.getContextByIndex(inx);
				// var binding =  oBinding.getContextByIndex(inx);

				// aBatchOps.push(oTable.getModel().createBatchOperation(binding.sPath, "DELETE", binding));
			});
	

			if (aSelects.length > 0) {
				var dialog = new Dialog({
					title: 'Confirm',
					type: 'Message',
					content: [
						new Label({ text: 'Are you sure you want to delete ?' })
					],
					beginButton: new Button({
						text: 'Delete',
						enabled: true,
						press: function () {
							
						var oModel = oTable.getModel();

						// oModel.addBatchChangeOperations(aBatchOps);

						//    model.submitBatch(function(data) {
						// 	model.refresh();
						// });

						oModel.setUseBatch(true);

						aItems.forEach(function(item){
							oModel.remove(item.sPath);
						});

						oModel.setUseBatch(false);

						function handler(oEvent){
							var oParam = oEvent.getParameters();
							if(oParam.method === 'DELETE'){

								var _inx = aItems.findIndex(function( item ){
									return oParam.url.indexOf(item.sPath) >=0;
								})
								aItems.splice(_inx, 1);
								if(aItems.length === 0){
									oModel.detachEvent('requestCompleted', handler);
									oModel.refresh();
									dialog.close();
								}
							}
						}
						oModel.attachEvent('requestCompleted', handler);
						}
					}),
					endButton: new Button({
						text: 'Cancel',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();

			}

		},

		onSwitch:function(oEvent){

			 var oScope = this.getView().byId("scopeTab");
			// var omaster = this.getView().byId("master2");
			 var fScope = sap.ui.xmlfragment(this.getView().getId(), "fin.confin.con.groupshare.view.Scope", this);
			 this.getView().addDependent(fScope );
			 oScope.addContent(fScope);
		}
		// onBeforeRebind:function(oEvent){



		// }
	});
});