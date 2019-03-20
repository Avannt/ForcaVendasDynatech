function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZFORCA_VENDAS_VB_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}