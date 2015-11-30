
(function (MicroMaps, $, undefined) {
	MicroMaps.config = {
        language : 'en',
        debug : true,
		urls : {
			"404" : "404.html",
			"500" : "500.html",
			homepage : "index.html"
		},

		//MAP_CENTER: [51.2, 7],
		MAP_CENTER: [0,0],
		MAP_DEFAULT_ZOOM: 2,

		container :	".container",
		SidebarContainer :	".sidebar-container",
		SidebarHeader :	".sub-header",

		textContainer : "#text .content",
		imageContainer : "#image .content",
		videoContainer : "#video .content",
		aerialContainer : "#aerial .content",
		threeWContainer : "#3w .content",

		//API : "http://ec2-54-148-39-119.us-west-2.compute.amazonaws.com:8080/MMAPI/rest/micromaps/JSONP/",
		API : "http://199.223.234.225/MMAPI/rest/micromaps/JSONP/",
		//API : "http://localhost:8080/MMAPI/rest/micromaps/JSONP/",
		HOST : "http://199.223.234.225/",
		datasource : "../../data/",

		image: "Image",
		video: "Video",
		aerial: "Aerial",
		text: "Text",
		threeW: "3w"
	};

	toastr.options = {
		 "closeButton": true,
		 "debug": true,
		 "newestOnTop": true,
		// "progressBar": true,
		"positionClass": "notification",
		// "preventDuplicates": true,
		// "showDuration": "300",
		// "hideDuration": "1000",
		// "timeOut": "5000",
		// "extendedTimeOut": "1000",
		//"showEasing": "swing",
		//"hideEasing": "linear",
		//"showMethod": "fadeIn",
		//"hideMethod": "fadeOut"
	};

/**
* Check to evaluate whether 'MicroMaps' exists in the global namespace - if not, assign window.MicroMaps an object literal
*/
}(window.MicroMaps = window.MicroMaps || {}, jQuery));
