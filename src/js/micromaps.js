
/* MicroMaps (our namespace name) and undefined are passed here
 * To ensure 1. Namespace can be modified locally and isn't
 * overwritten outside of our function context
 * 2. The value of undefined is guaranteed as being truly
 * Undefined. This is to avoid issues with undefined being
 * Mutable pre-ES5.
*/

(function (MicroMaps, $, undefined) {
    'use strict';

    /**
     * Logging function, for debugging mode
     */
    jQuery.log = function (message) {
        if (MicroMaps.config.debug && (typeof window.console !== 'undefined' && typeof window.console.log !== 'undefined') && console.debug) {
            console.debug(message);
        } /*else {
            alert(message);
        }*/
    };

    MicroMaps.maps = (function () {
        function _Map() {
            $.log("initializing MicroMapping");
            /**
            * In non-strict mode, 'this' is bound to the global scope when it isn't bound to anything else.
            * In strict mode it is 'undefined'. That makes it an error to use it outside of a method.
            */
            var _this = this;

            /**
             * Private properties
             */
            var map, sidebar;
            var selectedCrisis = [];
            var markerClusterGroup;

            /**
             * Public methods and properties
             */

            /*MicroMaps.sidebar = sidebar;*/

            /**
            * Init call
            * Call various methods require by pages after load
            */
            _this.init = function () {
                _this.setupMap();
                _this.MicroMapsInit();
                return this;
            };

            _this.MicroMapsInit = (function() {

                $( document ).tooltip({ track: true });

                $(MicroMaps.config.SidebarHeader).on( 'click', function () {
                    $.log('closing Sidebar');
                    sidebar.close();
                });

            });

            /*
            * Map Initialization
            */
            _this.setupMap = function () {

                $.log("initializing Mapview");

                map = L.map('map', {
                    'zoomControl': false
                });

                map.addControl(L.control.zoom({position: 'bottomright'}));

                map.setView(MicroMaps.config.MAP_CENTER, MicroMaps.config.MAP_DEFAULT_ZOOM);

                //map.fitWorld();

                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: 'MicroMappers'
                }).addTo(map);

                _this.markerClusterGroup = L.markerClusterGroup({animateAddingMarkers: true, maxClusterRadius: 1});

                sidebar = L.control.sidebar('sidebar').addTo(map);

                MicroMaps.map = map;
            };

            _this.addLayer = function (layer) {
                map.addLayer(layer);
            };

            _this.removeLayer = function (layer) {
                map.removeLayer(layer);
            };

            _this.fitBounds = function (layer) {
                map.fitBounds(layer);
            };

            _this.getInstanceLayer = function (layer){
                return map._instanceLayer(layer);
            };

            return _this.init(); /*initialize the init()*/
        }

        return new _Map();
    }());

    MicroMaps.Crisis = (function () {
        function _Crisis () {
            $.log("initializing MicroMapping Crisis Management");
            var _this = this;

            var activeCrisis = {};
            var _crisis = [];
            var layerLayer = {};
            var CrisisList = {};
            var crisisIdMap = {};
            var crisisTreeMap = {};
            var downloadNode;
            var map = MicroMaps.maps;

            _this.init = function () {
                _this.load();
                return this;
            };

            /* Notification
            toastr.info("adding crisis to map");
            toastr.success("added to map successfully");
            toastr.warning("Crisis already exists in list");
            toastr.error("Unable to connect with server");
            */

            _this.load = function () {
                $('#loading-widget').show();
                $("#image-modal").click(function() {
                   $("#image-modal").hide();
                   $(".zoomContainer").remove();
                });

                $.ajax({
                    url: MicroMaps.config.API + "crisis",
                    //url: "../data/crisisSample.json",
                    dataType: "jsonp",
                    jsonpCallback:"jsonp",
                    success: function(data) {


                        var sorted = data.sort(function (a, b) {
                            if (a.type > b.type) { return 1; }
                            if (a.type < b.type) { return -1; }
                            return 0;
                       });
                        CrisisList = $.map(sorted, function(item) {
                            var status = (item.status !== undefined) ? item.status : 'inactive';
                            return {
                                label: item.name,
                                category: item.type,
                                status: status,
                                clientId: item.clientAppID,
                                otherItem: item
                            };
                        });
                        _this.populateMap(CrisisList);
                        _this.populateCrisis(crisisIdMap);

                        var crsisSearchList = [];
                        $.each(crisisIdMap, function(crisisID, crisisClickers){
                          crsisSearchList.push(crisisClickers[0]);
                        });
                        $( "#searchCrisis" ).autocomplete({
                          source: crsisSearchList,
                          select: function( event, ui ) {
                            $.jstree.reference('#crisesView').check_node('#' + ui.item.otherItem.crisisID);
                          }
                        });

                        $('#loading-widget').hide();
                    }
                });
            };

            _this.populateMap = function(CrisisList){
                $.each(CrisisList, function( i, val){
                  if( crisisIdMap[val.otherItem.crisisID] == null ){
                    crisisIdMap[val.otherItem.crisisID] = [val];
                  } else{
                    crisisIdMap[val.otherItem.crisisID].push(val);
                  }
                });
            }

            _this.getClickerIcon = function(clicker){
               if(clicker == "Text"){
                 return "fa fa-file-text-o" ;
               }else if(clicker == "Image"){
                 return "fa fa-picture-o" ;
               }else if(clicker == "Video"){
                 return "fa fa-video-camera" ;
               }else if(clicker == "Aerial"){
                return "fa fa-plane" ;
               }
            }

            _this.downloadGeoJson = function(node){
                $('#loading-widget').show();
                var API = node.type.toLowerCase() == "video" ? MicroMaps.config.API.replace("JSONP", "file") : MicroMaps.config.API;
                $.ajax({
                    url: API + node.type.toLowerCase() + "/id/" + node.clientId,
                    dataType: "jsonp",
                    jsonpCallback:"jsonp",
                    success: function(response) {
                      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response));
                    	 $('#downloadBtn').attr("href", dataStr);
                    	 $('#downloadBtn').attr("download", "geojson.json");
                       $("#downloadBtn")[0].click()
                       $('#loading-widget').hide();
                    },
                    error: function(response){
                      $('#loading-widget').hide();
                    }
                });
            }

            _this.downloadKML = function(node){
                $('#loading-widget').show();
                var API = MicroMaps.config.API.replace("JSONP", "kml")
                $.ajax({
                    url: API + node.type.toLowerCase() + "/id/" + node.clientId,
                    dataType: "xml",
                    success: function(response) {
                      var dataStr = "data:Application/octet-stream," + encodeURIComponent(new XMLSerializer().serializeToString(response));
                       $('#downloadBtn').attr("href", dataStr);
                       $('#downloadBtn').attr("download", "clicker.kml");
                       $("#downloadBtn")[0].click();
                       $('#loading-widget').hide();
                    },
                    error: function(errorMessage){
                      if(errorMessage.status == 200){
                        var dataStr = "data:Application/octet-stream," + encodeURIComponent(errorMessage.responseText);
                         $('#downloadBtn').attr("href", dataStr);
                         $('#downloadBtn').attr("download", "clicker.kml");
                         $("#downloadBtn")[0].click();
                      }
                      $('#loading-widget').hide();
                    }
                });
            }

            _this.populateCrisis = function(crisisIdMap){

              var crisisTreeJson = {
                  "plugins" : ["checkbox", "sort", "contextmenu"],
                  'core' : {
                      "check_callback": true,
                      "multiple" : true, // no multiselection
                      "themes" : {
                        "dots" : false // no connecting dots between dots
                      },
                      'data' : []
                  },
                  "contextmenu": {
                      "items": {
                          "geojson": {
                              "label": "Download Geojson",
                              "icon" : "fa fa-download",
                              "action" : function(obj){
                                _this.downloadGeoJson(_this.downloadNode);
                              }
                          },
                          "kml": {
                              "label": "Download KML",
                              "icon" : "fa fa-download",
                              "action" : function(obj){
                                _this.downloadKML(_this.downloadNode);
                              }
                          }
                      }
                  }
              }

              var crisisArrJSON = [];
              $.each(crisisIdMap, function(crisisID, crisisClickers){
                  var clickers = [];
                  $.each(crisisClickers, function( i, crisisClicker){
                    var clicker = {
                        "text" : crisisClicker.otherItem.type + " Clicker", "icon" : _this.getClickerIcon(crisisClicker.otherItem.type),
                        "crisisID" : crisisClicker.otherItem.crisisID, "type" : crisisClicker.otherItem.type, "clientId" : crisisClicker.clientId,
                        "level" : "clicker", "id" : crisisClicker.clientId
                    };

                    var labels = [];
                    $.each(crisisClicker.otherItem.style.style, function( i, style){
                      if(!style.markerColor){
                        if(style.color){
                          style.markerColor = style.color;
                        }
                      }
                      var a_attr = { "style" : "color: " + style.markerColor };
                      if(crisisClicker.otherItem.type.toLowerCase() == "aerial" ){
                        a_attr = { "style" : "color: " + style.markerColor + "; pointer-events: none; opacity: 0.6"};
                      }
                      var label = {
                          "text" : style.label,
                          "markerColor" : style.markerColor,
                          "icon" : "fa fa-map-marker",
                          "a_attr": a_attr,
                          "labelCode" : style.label_code,
                          "crisisID" : crisisClicker.otherItem.crisisID,
                          "type" : crisisClicker.otherItem.type,
                          "clientId" : crisisClicker.clientId,
                          "level" : "label"
                      }
                      labels.push(label);
                    });
                    clicker.children = labels;
                    clickers.push(clicker);
                  });
                  var clickerJson = {
                      "text" : crisisClickers[0].label,
                      "icon" : "fa fa-exclamation",
                      "level" : "crisis",
                      "crisisID" : crisisClickers[0].otherItem.crisisID,
                      "id" : crisisClickers[0].otherItem.crisisID,
                      "children" : clickers
                  }
                  crisisArrJSON.push(clickerJson);
              })
              crisisTreeJson.core.data = crisisArrJSON;
              $('#crisesView').jstree(crisisTreeJson);

               $('#crisesView').on("show_contextmenu.jstree", function (e, node, x, y) {
                 if(node.node.original.level == "clicker"){
                   _this.downloadNode = node.node.original;
                 } else {
                    $(".jstree-default-contextmenu").remove();
                 }
              });

              $('#crisesView').on("changed.jstree", function (e, data) {
                var clientId = data.node.original.clientId;
                var crisisType = data.node.original.type;
                var nodeLevel = data.node.original.level;
                var crisisID = data.node.original.crisisID;
                var labelCode = data.node.original.labelCode;

                if(nodeLevel == "crisis"){
                  var crisisClickers = crisisIdMap[crisisID];
                  $.each(crisisClickers, function( i, crisisClicker){
                    _this.loadLayer(data, crisisClicker.otherItem.type, crisisClicker.clientId, labelCode, crisisID);
                  });
                } else if(nodeLevel == "clicker"){
                  _this.loadLayer(data, crisisType, clientId, labelCode, crisisID);
                } else if(nodeLevel == "label"){
                  _this.loadLayer(data, crisisType, clientId, labelCode, crisisID);
                }
              });

            }

            _this.replaceURLWithHTMLLinks = function(text) {
                var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                return text.replace(exp,"<a target='_blank' href='$1'>$1</a>");
            }

            _this.loadLayer = function(data, crisisType, clientId, labelCode, crisisID){
                if(data.selected.indexOf(data.node.id) >= 0 && (crisisTreeMap[crisisID] == null || crisisTreeMap[crisisID][clientId] == null)){
                  $('#loading-widget').show();

                  var API = crisisType.toLowerCase() == "video" ? MicroMaps.config.API.replace("JSONP", "file") : MicroMaps.config.API;
                  $.ajax({
                      //url: "../data/" + crisisID + ".json",
                      //url: "../data/" + "newAerial.json",
                      url: API + crisisType.toLowerCase() + "/id/" + clientId,
                      dataType: "jsonp",
                      jsonpCallback:"jsonp",
                      success: function(response) {
                          toastr.info("New locations Added to Map.");

                          var geoJsonMap = {};

                          $.each(response.features, function( i, feature){
                            if(geoJsonMap[feature.properties.category] == null){
                              geoJsonMap[feature.properties.category] = [];
                            }
                            geoJsonMap[feature.properties.category].push(feature);
                          });

                          $.each(geoJsonMap, function(category, features){
                            var geoJson = { "type" : "FeatureCollection", "features" : features};
                            crisisLayer = L.geoJson(geoJson);



                            crisisLayer = L.geoJson(geoJson, {
                                onEachFeature: function (feature, layer) {
                                    var markerColor = "blue";
                                    if(crisisType.toLowerCase() == "text" && feature.properties.tweet){
                                        layer.bindPopup(_this.replaceURLWithHTMLLinks(feature.properties.tweet));
                                        if(feature.properties.style){
                                          markerColor = feature.properties.style.markerColor;
                                          layer.bindLabel(feature.properties.style.label);
                                        }
                                    } else if(crisisType.toLowerCase() == "image" && feature.properties.url){
                                      layer.on("click", function (e) {
                                        //alert("yes");
                                        $("#zoom_image").attr("src", feature.properties.url);
                                        $("#zoom_image").attr("data-zoom-image", feature.properties.url);

                                        $("#image-modal").show();
                                        $(".zoomContainer").show();

                                        $("#zoom_image").elevateZoom({ zoomType: "inner", cursor: "crosshair", scrollZoom: true });
                                        //$(".zoomContainer").hide();
                                      });

                                      layer.bindLabel(feature.properties.style.label);
                                      markerColor = feature.properties.style.markerColor;
                                    } else if(crisisType.toLowerCase() == "video"){
                                      layer.on("click", function (e) {

                                        console.log(_this.getEmbedUrl(feature.properties.url));
                                        $("#uavVideo").attr('src', _this.getEmbedUrl(feature.properties.url));
                                        window.location.href='#video-modal';
                                      });

                                      layer.bindLabel(feature.properties.style.label);
                                      markerColor = feature.properties.style.markerColor;
                                    } else if(crisisType.toLowerCase() == "aerial"){
                                      layer.on("click", function (e) {
                                        _this.renderAerialMap(e, feature);
                                        window.location.href='#aerial-modal';
                                      });
                                    }


                                    layer.setIcon(L.AwesomeMarkers.icon({
                                      icon: _this.getIconByType(crisisType),
                                      prefix: 'fa',
                                      markerColor: markerColor
                                    }));

                                    MicroMaps.maps.markerClusterGroup.addLayer(layer);
                                }
                            });

                            if( crisisTreeMap[crisisID] == null ){
                              crisisTreeMap[crisisID] = {};
                            }
                            if( crisisTreeMap[crisisID][clientId] == null){
                              crisisTreeMap[crisisID][clientId] = {};
                            }
                            if( crisisTreeMap[crisisID][clientId][category] == null){
                              crisisTreeMap[crisisID][clientId][category] = { "crisisLayer" : crisisLayer };
                            }
                            if(labelCode == null || (labelCode != null && labelCode == category) ) {
                              map.addLayer(crisisLayer);
                              map.fitBounds(crisisLayer);

                              // map.addLayer(MicroMaps.maps.markerClusterGroup);
                              // map.fitBounds(MicroMaps.maps.markerClusterGroup.getBounds());
                            }
                          });
                          $('#loading-widget').hide();
                      },
                      error: function(response){
                        toastr.error("Unable to load map. Try again.");
                        $('#loading-widget').hide();
                      }
                  });
                } else {
                  if ( data.selected.indexOf(data.node.id) < 0){
                    if(labelCode != null){
                      if(crisisTreeMap[crisisID][clientId][labelCode] != null){
                        var crisisLayer = crisisTreeMap[crisisID][clientId][labelCode].crisisLayer
                        map.removeLayer(crisisLayer);
                      }
                    } else {
                      var crisisLayers = crisisTreeMap[crisisID][clientId]
                      $.each(crisisLayers, function(labelCode, data){
                        map.removeLayer(data.crisisLayer);
                      });
                    }
                  } else {
                    toastr.info("New locations Added to Map.");
                    if(labelCode != null){
                      if(crisisTreeMap[crisisID][clientId][labelCode] != null){
                        var crisisLayer = crisisTreeMap[crisisID][clientId][labelCode].crisisLayer
                        map.addLayer(crisisLayer);
                        map.fitBounds(crisisLayer);
                      }
                    } else {
                      var crisisLayers = crisisTreeMap[crisisID][clientId]
                      $.each(crisisLayers, function(labelCode, data){
                        map.addLayer(data.crisisLayer);
                        map.fitBounds(data.crisisLayer);
                      });
                    }
                  }
                }
            }
            _this.getIconByType = function (crisis_type) {
              if(crisis_type.toLowerCase() == "text"){
                return "text-width";
              } else if(crisis_type.toLowerCase() == "image"){
                return "file-image-o";
              } else if(crisis_type.toLowerCase() == "video"){
                return "video-camera";
              } else if(crisis_type.toLowerCase() == "aerial"){
                return "plane";
              }
            }

            _this.getEmbedUrl = function(origUrl) {
                if (origUrl.match(/youtube/)) {
                    var vid = origUrl.match(/v=([^&]+)/)[1];
                    return "http://www.youtube.com/embed/" + vid + "?autoplay=1&showinfo=1&controls=1";
                } else if (origUrl.match(/vimeo/)) {
                    var vid = origUrl.substr(17);
                    return "http://player.vimeo.com/video/" + vid;
                }
                return origUrl;
            }

            _this.renderAerialMap = function(e, feature){
                $('#map_task1').remove();
                var divIndex = 1;
                var map_div = $("<div/>", {id:"map_task" + divIndex, 'class': 'span4', 'style':'margin-left:0px'});
                var map_canvas = $("<div/>", {id: "map_" + divIndex, 'class': 'map_canvas'});
                map_canvas.css("width", "740px");
                map_canvas.css("height", "740px");
                map_div.append(map_canvas);
                $("#aerialMapContainer").prepend(map_div);

                var currentGeoBoundsArray = eval(feature.properties.bounds);
                //var currentGeoBoundsArray =  [125.00587463378906, 11.241715102754723, 125.00553131103516, 11.241378366973036];

                var southWest1 = L.latLng(currentGeoBoundsArray[3],currentGeoBoundsArray[2]),
                 northEast1 = L.latLng(currentGeoBoundsArray[1],currentGeoBoundsArray[0]),
                 bounds1 = L.latLngBounds(southWest1, northEast1);

                var centerPoint1 = bounds1.getCenter();

                var selectedMap = L.map("map_" + divIndex,{maxZoom:32, minZoom:14}).setView([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 21);
                var imageBounds = [[currentGeoBoundsArray[3], currentGeoBoundsArray[2]], [currentGeoBoundsArray[1], currentGeoBoundsArray[0]]];



                //var sImgURL = feature.properties.imgURL.replace('aidr-prod.qcri.org/data/trainer/pam', 'qcricl1linuxvm2.cloudapp.net/data/trainer/pam/pam' );
                var sImgURL = feature.properties.imgURL.replace('aidr-prod.qcri.org/data/trainer/pam', 'aidr-prod.qcri.org/trainer/pam' );


                L.imageOverlay(sImgURL, imageBounds).addTo(selectedMap);

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(selectedMap);

                selectedMap.setMaxBounds(imageBounds);
                var features = feature.properties.features;
                var aerialGeoJson = { "type" : "FeatureCollection", "features" : features};

                L.geoJson(aerialGeoJson, {
                    onEachFeature: function (feature, layer) {
                    },
                    style: function(layer) {
                        if(layer && layer.properties && layer.properties.layerType){
                          switch (layer.properties.layerType) {
                              case 'polygon': return {color:"#f00909"};
                              case 'polygon2': return {color:"#f08c09"};
                              default:return {color:"#090df0"};
                          }
                        }
                    }
                }).addTo(selectedMap);
            }

            return _this.init(); /*initialize the init()*/
        }

        return new _Crisis();
    }());

/**
* Check to evaluate whether 'MicroMaps' exists in the global namespace -
* if not, assign window.MicroMaps an object literal
*/
}(window.MicroMaps = window.MicroMaps || {}, jQuery));
