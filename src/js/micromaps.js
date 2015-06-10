
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

                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: 'MicroMappers'
                }).addTo(map);

                sidebar = L.control.sidebar('sidebar').addTo(map);

                MicroMaps.map = map;
            };

            _this.addLayer = function (layer) {
                map.addLayer(layer);
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
                        $("#search").catcomplete({
                            delay: 0,
                            minlength:0,
                            autoFocus:true,
                            source: CrisisList,
                            select: function (event, selected) {
                                var newCrisis = selected.item;
                                MicroMaps.Crisis.add(newCrisis);
                            }
                        });
                    }
                });
            };

            _this.add = function (crisisArr) {

                $.log(CrisisList);

                var crisisType = crisisArr.category;
                var crisisID = crisisArr.clientId;

                if (crisisArr.status == 'active'){
                    alert("<b>"+crisisArr.label + "</b> is already added to Crisis Stack.");
                }else{

                    $.ajax({
                        //url: "../data/" + crisisID + ".json",
                        url: MicroMaps.config.API + crisisType.toLowerCase() + "/id/" + crisisID,
                        dataType: "jsonp",
                        jsonpCallback:"jsonp",
                        success: function(data) {
                            
                            var crisisLayer = L.geoJson(data);
                            
                            $.log(crisisLayer);

                            var id = L.stamp(crisisLayer);

                            layerLayer[id] = crisisLayer;

                            _crisis[id] = crisisArr;
                            _crisis[id]['layerid'] = id;

                            _this._createItem(_crisis[id]);

                            toastr.info("Successfully Added <b>" + crisisArr.label + "<b> to <b>" + crisisArr.category + " </b> ");

                        }
                    });
                    
                }

            };

            _this.remove = function (crisisArr) {
                $.log("removing new Crisis to list. Name : "+crisisArr);
                toastr.info("removing new Crisis to list. Name : "+crisisArr);

            };

            _this.setActive = function (crisisArr) {
                $.log("set Crisis as Active. Name : "+crisisArr);
            };

            _this._instanceLayer = function(layerDef) {
                if(layerDef instanceof L.Class)
                    return layerDef;
                else if(layerDef.type && layerDef.args)
                    return this._getPath(L, layerDef.type).apply(window, layerDef.args);
            
            };

            _this._createItem = function (item) {
                $.log("Adding new Crisis to list.");

                var className = 'leaflet-layers';
                var newItem, input, label, checked;

                $.log(item);

                input = '<input type="radio" id="'+item.layerid+'" name="'+item.category+'" value="'+item.layerid+'">';
                input += '<label for="'+item.layerid+'"><div class="layerInfo">'+
                            '<div class="layerName">' + item.label + '</div>'+
                            '<div class="layerDate">Start Date: ' + item.otherItem.activationStart + ' <br>End Date: ' + item.otherItem.activationEnd + '</div>'+
                            '</div><div><i title="Download Crisis" class="fa fa-download"></i><i class="fa fa-cross"></i>'+
                            '</div></label>';
                
                $.log(item.category);

                if(item.category === MicroMaps.config.text){
                    checked = ($(MicroMaps.config.textContainer).find("input").length === 0)  ? true : false;
                    $(MicroMaps.config.textContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.textContainer);

                }else if(item.category === MicroMaps.config.image){
                    checked = ($(MicroMaps.config.imageContainer).find("input").length === 0)  ? true : false;
                    $(MicroMaps.config.imageContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.imageContainer);

                }else if(item.category === MicroMaps.config.video){
                    checked = ($(MicroMaps.config.videoContainer).find("input").length === 0)  ? true : false;
                    $(MicroMaps.config.videoContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.videoContainer);

                }else if(item.category === MicroMaps.config.aerial){
                    checked = ($(MicroMaps.config.aerialContainer).find("input").length === 0)  ? true : false;
                    $(MicroMaps.config.aerialContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.aerialContainer);

                }else if(item.category === MicroMaps.config.threeW){
                    checked = ($(MicroMaps.config.threeWContainer).find("input").length === 0)  ? true : false;
                    $(MicroMaps.config.threeWContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.threeWContainer);

                }
                
                /*$.each(CrisisList, function( i, val){
                    if (item.clientId == val.clientId){
                        CrisisList[i]['status'] = "active";
                        $.log(CrisisList[i]);
                    }
                });*/
                if (checked) { 
                    var layer = layerLayer[item.layerid];
                    map.addLayer(layer);
                    map.fitBounds(layer);
                }
                $('#'+item.layerid).attr('checked', checked);
            
            };

            return _this.init(); /*initialize the init()*/
        }

        return new _Crisis();
    }());

/**
* Check to evaluate whether 'MicroMaps' exists in the global namespace -
* if not, assign window.MicroMaps an object literal
*/
}(window.MicroMaps = window.MicroMaps || {}, jQuery));
