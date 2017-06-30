sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/m/Dialog',
	'sap/m/Button',
	'./NewActivity',
	'sap/m/Label',
	'sap/m/Table',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/m/Text',
], function (Controller, JSONModel, Dialog, Button, NewActivity, Label, Table, Export, ExportTypeCSV, Text) {
	"use strict";

	const COPY_MODEL = '__copy__';

	function addEvent(ele, type, handler) {

		if (window.addEventListener) {
			ele.addEventListener(type, handler, false);
		} else if (window.attachEvent) {
			ele.attachEvent('on' + type, function () {
				handler.apply(ele, [].slice.call(arguments));
			}, false);
		} else {
			ele['on' + type] = handler;
		}
	}

	function removeEvent(ele, type, handler) {
		if (window.removeEventListener) {
			ele.removeEventListener(type, handler);
		} else if (window.detachEvent) {
			ele.detachEvent('on' + type);
		} else {
			ele['on' + type] = undefined;
		}
	}

	function toPromise(fn ,context){

		var dtd = $.Deferred();
		var _con = context || null;
		return function(){
			var args = [].slice.call(arguments);
			args.length < 3 &&args.push({});
			args[2].success = function(data){
				dtd.resolve(data);
			};
			args[2].error= function(err){
				dtd.reject(err);
			}
			fn.apply(_con, args)
			return dtd.promise();
		}
	}

	return Controller.extend("fin.confin.con.groupshare.controller.GroupShare", {
		onInit: function () {
			this.__aChangeList = [];
			var aFiscalYear = {
				data: [{ key: '2017.001', value: '2017.001' },
				{ key: '2017.002', value: '2017.002' },
				{ key: '2017.003', value: '2017.003' },
				{ key: '2017.004', value: '2017.004' },
				{ key: '2017.005', value: '2017.005' },
				{ key: '2017.006', value: '2017.006' }
				]
			};
			var oFiscalModel = new JSONModel(aFiscalYear);
			this.getView().setModel(oFiscalModel, "fiscalYear");

			this.getView().setModel(new JSONModel({results:[]}) , COPY_MODEL);

			var that = this;
			this.confirmToCopyDialog = new Dialog({
				title: 'Switch mode confirmation',
				type: 'Message',
				content: new Text({ text: "Your changes do not saved, do you want to give up changes and switch to copy mode?" }),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						that.confirmToCopyDialog.close();
					}
				}),
				beginButton: new Button({
					text: 'Yes',
					press: function () {
						that.__switchToCopyMode();
						that.confirmToCopyDialog.close();
					}
				}),
			});
			this.getView().addDependent(this.confirmToCopyDialog);
			this.confirmToNormalDialog = new Dialog({
				title: 'Switch mode confirmation',
				type: 'Message',
				content: new Text({ text: "Your changes do not saved, do you want to give up changes and switch to normal mode?" }),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						that.confirmToNormalDialog.close();
					}
				}),
				beginButton: new Button({
					text: 'Yes',
					press: function () {
						that.__switchToNormalMode();
						that.confirmToNormalDialog.close();
					}
				}),
			});
			this.getView().addDependent(this.confirmToNormalDialog);
			this.DataErrorlDialog = new Dialog({
				title: 'Data mismatch',
				type: 'Message',
				state: 'Error',
				content: new Text({ text: 'You data does not match with grid!' }),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						that.DataErrorlDialog.close();
					}
				})
			});
			this.getView().addDependent(this.DataErrorlDialog);

			var _oModel = this.getOwnerComponent().getModel();
			this.__initialLoad(_oModel);

			this.pastHandler = function (e) {

				var _id = this.getView().byId('activityList').getId();
				var data = e.clipboardData || window.clipboardData;
				var _html = data.getData('text/html');
				var _results = [];
				var oMeta = this.__resolveMeta();
				var _aMatch = _html.match(/<table([\s\S]*)<\/table>/);
				if (_aMatch) {
					var frame = document.createElement("div");
					frame.innerHTML = _aMatch[0];
					var aTrs = frame.getElementsByTagName("tr");
					if (aTrs) {
						if (aTrs[0].getElementsByTagName("td").length !== Object.keys(oMeta).length) {
							this.DataErrorlDialog.open();
						} else {
							[].forEach.call(frame.getElementsByTagName("tr"), function (_eTr, inx) {
								var oo = {};
								var oEle = null;
								oEle = _eTr.getElementsByTagName("td");
								[].forEach.call(oEle, function (_eSpan, inx) {
									oo[oMeta[inx]] = _eSpan.innerText;
								})
								_results.push(oo);
							});
							var _oJson = JSON.parse(this.getView().getModel(COPY_MODEL).getJSON());
							_oJson.results = _oJson.results ? _oJson.results.concat(_results) : _results;
							this.getView().getModel(COPY_MODEL).setJSON(JSON.stringify(_oJson));
						}
					}
				}

			}.bind(this);

			

			//this.getView().setModel(_oModel, "test");
			// var oTable = this.getView().byId('activityList');
			// oTable.bindRows({ path: '/InvestmentActivitys' });
			// var comp = this.getOwnerComponent();
			// this.__newDialog =  new NewActivity(this.getOwnerComponent().getRootControl());
		},

		__initialLoad: function (model) {
			var oView = this.getView(),
				oTable = oView.byId("activityList");
				oTable.bindRows({path: "/InvestmentActivitys"});
		},

		__resolveMeta: function () {

			var oTable = this.getView().byId("activityList");
			return oTable.getColumns().filter(function (col) {
				return col.getProperty("visible");
			}).reduce(function (pre,vCol, inx) {
				var binding = vCol.getAggregation('template').getBindingInfo('value');
				if (binding.parts) {
					pre[inx] = binding.parts[0].path;
					return pre;
				}
			},{});
		},

		onSaveCopy: function (e) {

			var that = this;
			var odata = this.getView().getModel();
			var oModel = this.getView().getModel(COPY_MODEL);
			var createEntity = toPromise(odata.create,odata);

			// createEntity('/InvestmentActivitys', JSON.parse(oModel.getJSON()).results[0]).done(function(){
			// 	console.log('success')
			// }).fail(function(){
			// 	console.log('error')
			// });
			
			// JSON.parse(oModel.getJSON()).results.forEach(function(oData){
			odata.create('/InvestmentActivitys', JSON.parse(oModel.getJSON()).results[0], {
				success: function () {
					that.__switchToNormalMode();
				},
				error: function (err) {
					console.error(err);
				}
			});

			// });


		},

		showConfirmDialog: function (text, confirmCb) {


		},

		__switchToCopyMode() {
			this.__aChangeList = [];
			//this.getView().getModel('test').setJSON("{}");
			var oTable = this.getView().byId("activityList");
			oTable.unbindRows();
			oTable.setModel(oTable.getModel(COPY_MODEL));
			oTable.bindRows("/results");
			this.getView().byId("fin__copy--normal").setVisible(false);
			this.getView().byId("fin__export--normal").setVisible(false);
			this.getView().byId("fin__save--normal").setVisible(false);
			this.getView().byId("fin__save--copy").setVisible(true);
			this.getView().byId("fin__cancel--copy").setVisible(true);
			addEvent(document.getElementById(oTable.getId()), 'paste', this.pastHandler);
		},

		__switchToNormalMode() {
			this.__aChangeList = [];
			this.getView().getModel(COPY_MODEL).setJSON('{"results":[]}');
			var oTable = this.getView().byId("activityList");
			oTable.unbindRows();
			oTable.setModel(this.getView().getModel());
			oTable.bindRows({path: "/InvestmentActivitys"});
			this.getView().byId("fin__copy--normal").setVisible(true);
			this.getView().byId("fin__export--normal").setVisible(true);
			this.getView().byId("fin__save--normal").setVisible(true);
			this.getView().byId("fin__save--copy").setVisible(false);
			this.getView().byId("fin__cancel--copy").setVisible(false);
			removeEvent(document.getElementById(this.getView().byId("activityList").getId()), 'paste');
			this.__initialLoad(this.getView().getModel());
		},

		onSwitchToCopy: function (e) {
			if (this.__aChangeList.length > 0) {
				this.confirmToCopyDialog.open();
			} else {
				this.__switchToCopyMode();
			}
		},

		onSwitchToNormal: function () {

		},

		onCancelCopy: function (e) {
			var results = this.getView().getModel(COPY_MODEL).getJSON().results;
			if(results && results.length > 0){
				this.confirmToNormalDialog.open();
			}else{
				this.__switchToNormalMode();
			}
			
			// if (this.__aChangeList.length > 0 || ) {
			// 	this.confirmToNormalDialog.open();
			// } else {
			// 	this.__switchToNormalMode();
			// }
		},

		onLiveChange: function (e) {

			var oParam = e.getParameters();
			var changedItem = {
				id: oParam.id,
				value: e.getSource()._lastValue
			};
			var _target = this.__aChangeList.find(function (item) {
				return item.id === changedItem.id;
			});
			if (_target) {
				if (_target.value === oParam.value) {
					this.__aChangeList.splice(this.__aChangeList.findIndex(function (_it) {
						return _it.id === changedItem.id;
					}), 1);
				}
			} else {
				this.__aChangeList.push(changedItem);;
			}
		},

		onExport: Table.prototype.exportData || function (e) {

			var oExport = new Export({
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),
				models: this.getView().getModel(),

				columns: [{
					name: "ActivityNumber",
					template: {
						content: "{ActivityNumber}"
					}
				}, {
					name: "InvesterText",
					template: {
						content: "{InvesterText}"
					}

				}]
			});

			oExport.saveFile().then(function () {
				oExport.destroy();
			}).catch(function (err) {
				console.error(err);
			});
		},

		onCellClick: function (e) {
			// console.log("cell click");
			console.log(e);
		},

		onCellContextmenu: function (e) {
			console.log("cell menu click");
			console.log(e);
		},

		domReady: function (fn) {

			var _ready = false;

			if (window.addEventListener) {
				document.addEventListener('DOMContentLoaded', function () {
					if (!_ready) {
						fn.apply(document, [].slice.call(arguments));
						_ready = true;
					}
				});
			} else if (window.attachEvent) {
				document.attachEvent('onreadystatechange', function () {
					if (document.readyState === 'complete' && !_ready) {
						fn.call(document, [].slice.call(arguments));
						_ready = true;
					}
				});
			}

		},
		onSearch: function (event) {

			var oTable = this.byId("activityList");
			// oTable.getBinding("groupshare>/InvestmentActivitys").filter([]);
			var oView = this.getView(),
				_model = oView.getModel();

			_model.read("/InvestmentActivitys", {
				success: function (oData, res) {

					// oView.setModel(new JSONModel(oData), COPY_MODEL);
					// oTable.bindRows("__copy__>/results");
				}.bind(this),
				error: function (error) {
					console.log(error);
				}.bind(this)
			});

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

			var aItems = aSelects.map(function (inx) {

				return oBinding.getContextByIndex(inx);
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

							aItems.forEach(function (item) {
								oModel.remove(item.sPath);
							});

							oModel.setUseBatch(false);

							function handler(oEvent) {
								var oParam = oEvent.getParameters();
								if (oParam.method === 'DELETE') {

									var _inx = aItems.findIndex(function (item) {
										return oParam.url.indexOf(item.sPath) >= 0;
									})
									aItems.splice(_inx, 1);
									if (aItems.length === 0) {
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

		onSwitch: function (oEvent) {

			var oScope = this.getView().byId("scopeTab");
			// var omaster = this.getView().byId("master2");
			var fScope = sap.ui.xmlfragment(this.getView().getId(), "fin.confin.con.groupshare.view.Scope", this);
			this.getView().addDependent(fScope);
			oScope.addContent(fScope);
		}
		// onBeforeRebind:function(oEvent){



		// }
	});
});