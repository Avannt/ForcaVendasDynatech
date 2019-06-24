function initModel() {
	var sUrl = "/Dynatec_DEV/sap/opu/odata/sap/ZFORCA_VENDAS_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}