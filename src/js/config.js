
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
		//API : "http://199.223.234.225/MMAPI/rest/micromaps/JSONP/",
		API : "http://localhost:8080/MMAPI/rest/micromaps/JSONP/",
		datasource : "../../data/",

		image: "Image",
		video: "Video",
		aerial: "Aerial",
		text: "Text",
		threeW: "3w"
	};

	toastr.options = {
		"closeButton": false,
		"debug": true,
		"newestOnTop": true,
		"progressBar": true,
		"positionClass": "notification",
		"preventDuplicates": true,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};

	// $(function(){
	// 	$.widget( "custom.catcomplete", $.ui.autocomplete, {
	//         _create: function() {
	//             this._super();
	//             this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
	//         },
	//         _renderMenu: function( ul, items ) {
	//             var that = this,
	//             currentCategory = "";
	//             $.each( items, function( index, item ) {
	//                 // if ( item.category != currentCategory) {
	//                 // 	var cat = item.category;
	//                 // 	var icon = (cat == MicroMaps.config.text)?'mm mm-text':
	//                 // 				(cat == MicroMaps.config.image)?'fa fa-image':
	//                 // 				(cat == MicroMaps.config.video)?'fa fa-video-camera':
	//                 // 				(cat == MicroMaps.config.aerial)?'fa fa-globe':
	//                 // 				(cat == MicroMaps.config.threeW)?'fa mm-3w':'';
	//                 //     ul.append( "<li class='ui-autocomplete-category'> <i class='"+icon+"'></i>" +
	//                 //     			"<span class='pull-right'> " + cat + " Clicker</span></li>" );
	//                 //     currentCategory = cat;
	//                 // }
	// 								ul.append( "<li>" + item.label + "</li>" );
	//                 that._renderItem( ul, item );
	//             });
	//         },
	//         _renderItem: function( ul, item ) {
	//             var newText = String(item.value).replace(new RegExp(this.term, "gi"), "<span class='ui-autocomplete-suggestions'>$&</span>");
	//             if (item.status == 'inactive'){
	// 	            return $("<li></li>")
	// 	                .data("item.autocomplete", item)
	// 	                .append("<a>" + newText + "</a>")
	// 	                .appendTo(ul);
  //            }
	//         }
	//     });
	// });

/**
* Check to evaluate whether 'MicroMaps' exists in the global namespace - if not, assign window.MicroMaps an object literal
*/
}(window.MicroMaps = window.MicroMaps || {}, jQuery));
