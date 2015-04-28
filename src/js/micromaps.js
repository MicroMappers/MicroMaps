
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

                    $.ajax({
                        url: "../data/crisisSample.json",
                        dataType: "json",
                        success: function(data) {
                            var cat_data = $.map(data, function(item) {
                                return {
                                    label: item.name,
                                    category: item.type,
                                    created: item.created,
                                    desc: item.status
                                };
                            });
                            $("#search").catcomplete({
                                delay: 0,
                                source: cat_data,
                                minlength:0,
                                select: function (event, selected) {
                                    var newCrisis = selected.item;
                                    MicroMaps.Crisis.add(newCrisis, map);
                                }
                            });
                        }
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

                MicroMaps.map = map;

                map.addControl(L.control.zoom({position: 'bottomright'}));

                map.setView([51.2, 7], 9);

                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: 'MicroMappers'
                }).addTo(map);

                sidebar = L.control.sidebar('sidebar').addTo(map);
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

            /* Notification
            toastr.info("adding crisis to map");
            toastr.success("added to map successfully");
            toastr.warning("Crisis already exists in list");
            toastr.error("Unable to connect with server");
            */

            _this.add = function (crisisArr, map) {
                $.log(crisisArr);

                $.ajax({
                    url: "../data/MicroMaps-Sample-Revised.geojson",
                    dataType: "json",
                    success: function(data) {

                        $.log(data);
                        var crisisLayer = L.geoJson(data);

                        map.fitBounds(crisisLayer);
                        map.addLayer(crisisLayer);

                        var layerLayer = _this._instanceLayer(crisisLayer);
                        var id = L.stamp(layerLayer);
                        $.log(id);

                        _crisis[id] = {
                            id: id,
                            layer: layerLayer,
                            name: crisisArr.label,
                            date: crisisArr.created,
                            group: crisisArr.category
                        };

                        $.log(_crisis);

                        _this._createItem(_crisis[id]);

                        toastr.info("Successfully Added Crisis to map <br> <b>" + crisisArr.label + "<b>");

                    }
                });

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
                var className = 'leaflet-layers';
                var newItem, input, label, checked;


                input = '<input type="radio" id="'+item.id+'" name="'+item.group+'" value="'+item.id+'">';
                input += '<label for="'+item.id+'"><div class="layerInfo">'+
                            '<div class="layerName">' + item.name + '</div><div class="layerDate">' + item.date + '</div>'+
                            '</div><div><i title="Download Crisis" class="fa fa-download"></i><i class="fa fa-cross"></i>'+
                            '</div></label>';

                if(item.group == 'text'){
                    checked = ($(MicroMaps.config.textContainer).find("input").length == 0)  ? true : false;
                    $(MicroMaps.config.textContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.textContainer);

                }else if(item.group == 'image'){
                    checked = ($(MicroMaps.config.imageContainer).find("input").length == 0)  ? true : false;
                    $(MicroMaps.config.imageContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.imageContainer);

                }else if(item.group == 'video'){
                    checked = ($(MicroMaps.config.videoContainer).find("input").length == 0)  ? true : false;
                    $(MicroMaps.config.videoContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.videoContainer);

                }else if(item.group == 'aerial'){
                    checked = ($(MicroMaps.config.aerialContainer).find("input").length == 0)  ? true : false;
                    $(MicroMaps.config.aerialContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.aerialContainer);

                }else if(item.group == '3w'){
                    checked = ($(MicroMaps.config.threeWContainer).find("input").length == 0)  ? true : false;
                    $(MicroMaps.config.threeWContainer + ' .info').css({'display':'none'});

                    $(input).appendTo(MicroMaps.config.threeWContainer);

                }
                $.log(checked);
                $('#'+item.id).attr('checked', checked);
            };

        }

        return new _Crisis();
    }());

/**
* Check to evaluate whether 'MicroMaps' exists in the global namespace -
* if not, assign window.MicroMaps an object literal
*/
}(window.MicroMaps = window.MicroMaps || {}, jQuery));
