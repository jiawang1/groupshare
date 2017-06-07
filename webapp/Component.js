sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/odata/v4/ODataModel",
	"fin/confin/con/groupshare/model/models"
], function(UIComponent, Device,ODataModel, models) {
	"use strict";

	return UIComponent.extend("fin.confin.con.groupshare.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function

			
			UIComponent.prototype.init.apply(this, arguments);
			
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			 var oModel = new ODataModel({
         		serviceUrl : "/ConsolidationUnits/",
         		synchronizationMode : "None"
     });
		}
	});
});
