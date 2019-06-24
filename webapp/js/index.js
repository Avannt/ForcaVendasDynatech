var app = {
	// Application Constructor
	initialize: function() {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},

	// deviceready Event Handler
	//
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function() {
		this.receivedEvent('deviceready');
	},

	// Update DOM on a Received Event
	receivedEvent: function(id) {
		var parentElement = document.getElementById(id);
		var listeningElement = parentElement.querySelector('.listening');
		var receivedElement = parentElement.querySelector('.received');

		listeningElement.setAttribute('style', 'display:none;');
		receivedElement.setAttribute('style', 'display:block;');
		
		if(device.platform == "Android"){
			window.plugins.sim.hasReadPermission(successCallback, errorCallback);
			window.plugins.sim.requestReadPermission(successCallback, errorCallback);
			window.plugins.sim.getSimInfo(successCallback, errorCallback);
		}

		function successCallback(result) {
			console.log(result);
		}

		function errorCallback(error) {
			console.log(error);
		}

		console.log('Received Event: ' + id);
	}
};

app.initialize();