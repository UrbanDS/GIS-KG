axios.get("./enLocation.json").then(res => {
    const geoData = res.data
    load_map(geoData)
})

function load_map(geo_data) {
    // var geo_data = JSON.parse('./enLocation.json');
    var l = geo_data.length
    var features = new Array(l)
    for (let i = 0; i < l; i++) {
        let coordinates = ol.proj.transform(
            [parseFloat(geo_data[i].lon), parseFloat(geo_data[i].lat)],
            "EPSG:4326",
            "EPSG:3857"
        )
        let attr = {
            attribute: geo_data[i].title,
            link: geo_data[i].url,
            place: geo_data[i].place_name,
            journal: geo_data[i].journal,
        }
        features[i] = new ol.Feature({
            geometry: new ol.geom.Point(coordinates),
            attribute: attr,
        })
    }

    let source = new ol.source.Vector({
        features: features,
    })

    let clusterSource = new ol.source.Cluster({
        distance: 40,
        source: source,
    })

    var maxFeatureCount
    var vector = null
    var calculateClusterInfo = function (resolution) {
        maxFeatureCount = 0
        var features = layerVetor.getSource().getFeatures()
        var feature, radius
        for (var i = features.length - 1; i >= 0; --i) {
            feature = features[i]
            var originalFeatures = feature.get("features")
            var extent = ol.extent.createEmpty()
            var j = void 0,
                jj = void 0
            for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
                ol.extent.extend(
                    extent,
                    originalFeatures[j].getGeometry().getExtent()
                )
            }
            var bigger = feature.getProperties().features.length
            // console.log(bigger)
            maxFeatureCount = Math.max(maxFeatureCount, jj)
            // radius = (0.25 * (bigger + bigger)) / resolution
            if (bigger <= 100) {
                radius = 13 + (bigger - 1) * 0.01
            } else if (bigger > 100 && bigger <= 1000) {
                radius = 16 + (bigger - 100) * 0.01
            } else {
                radius = 26 + (bigger - 1000) * 0.01
            }
            feature.set("radius", radius)
        }
    }

    var currentResolution
    function styleFunction(feature, resolution) {
        if (resolution != currentResolution) {
            calculateClusterInfo(resolution)
            currentResolution = resolution
        }
        var style
        var size = feature.get("features").length
        // if (size >= 1) { }
        style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: feature.get("radius"),
                stroke: new ol.style.Stroke({
                    color: "#rgba(255, 204, 0, 0.2)",
                    width: 1,
                }),
                fill: new ol.style.Fill({
                    color: [
                        255,
                        153,
                        0,
                        Math.min(0.8, 0.4 + size / maxFeatureCount),
                    ],
                    // color: "rgba(255, 153, 0, 0.8)",
                }),
            }),
            text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                    color: "#fff",
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(0, 0, 0, 0.6)",
                    width: 3,
                }),
            }),
        })

        // else {
        //     var originalFeature = feature.get("features")[0]
        //     style = createEarthquakeStyle(originalFeature)
        // }
        return style
    }

    var styleCache = {}
    var layerVetor = new ol.layer.Vector({
        source: clusterSource,
        style: styleFunction,
        // style: function (feature, resolution) {
        //     var size = feature.get("features").length
        //     var style = styleCache[size]
        //     if (!style) {
        //         style = [
        //             new ol.style.Style({
        //                 // image: new ol.style.Icon(
        //                 //     /** @type {olx.style.IconOptions} */ ({
        //                 //         anchor: [0.5, 60],
        //                 //         anchorOrigin: "top-right",
        //                 //         anchorXUnits: "fraction",
        //                 //         anchorYUnits: "pixels",
        //                 //         offsetOrigin: "top-right",
        //                 //         offset: [0, 1],
        //                 //         scale: 0.2,
        //                 //         opacity: 0.75,
        //                 //         src: "circle.png",
        //                 //     })
        //                 // ),
        //                 image: new ol.style.Circle({
        //                     radius: 10,
        //                     stroke: new ol.style.Stroke({
        //                         color: "#rgba(255, 204, 0, 0.2)",
        //                         width: 1,
        //                     }),
        //                     fill: new ol.style.Fill({
        //                         color: "rgba(255, 153, 0, 0.8)",
        //                     }),
        //                 }),
        //                 text: new ol.style.Text({
        //                     text: size.toString(),
        //                     fill: new ol.style.Fill({
        //                         color: "#fff",
        //                     }),
        //                     stroke: new ol.style.Stroke({
        //                         color: "rgba(0, 0, 0, 0.6)",
        //                         width: 3,
        //                     }),
        //                 }),
        //             }),
        //         ]
        //         styleCache[size] = style
        //     }
        //     return style
        // },
    })
    const map = new ol.Map({
        view: new ol.View({
            center: [0, 0],
            zoom: 1,
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.Stamen({
                    layer: "toner",
                }),
            }),
        ],
        target: "js-map",
        controls: ol.control
            .defaults()
            .extend([
                new ol.control.FullScreen(),
                new ol.control.OverviewMap(),
                new ol.control.Zoom(),
                new ol.control.MousePosition(),
            ]),
    })
    map.addLayer(layerVetor)

    var container = document.getElementById("popup")
    var content = document.getElementById("popup-content")
    var closer = document.getElementById("popup-closer")

    var popup = new ol.Overlay(
        /** @type {olx.OverlayOptions} */ ({
            element: container,
            autoPan: true,
            positioning: "bottom-center",
            stopEvent: true,
            autoPanAnimation: {
                duration: 250,
            },
        })
    )
    map.addOverlay(popup)

    closer.onclick = function () {
        popup.setPosition(undefined)
        closer.blur()
        return false
    }

    // function addFeatrueInfo(info, link, placeName) {
    //     var elementDiv1 = document.createElement("a")
    //     elementDiv1.className = "markerText"
    //     elementDiv1.setAttribute("href", link)
    //     elementDiv1.setAttribute("target", "_blank")
    //     var elementDiv2 = document.createElement("div")
    //     place = "Place: " + placeName
    //     setInnerText(elementDiv2, place)
    //     //elementDiv.innerText = info.att.text;
    //     setInnerText(elementDiv1, info)
    //     content.appendChild(elementDiv1)
    //     content.appendChild(elementDiv2)
    // }
    function addFeatrueInfo(anArray) {
        var length = anArray.length
        var total = document.createElement("div")
        var toatal_number = "Total: " + length
        setInnerText(total, toatal_number)
        content.appendChild(total)
        anArray.map(i => {
            var text = i.values_.attribute
            var journal = text.journal
            var place = text.place
            var title = text.attribute
            var link = text.link
            var each_data = document.createElement("div")
            each_data.className = "markerText"
            var forJournal = document.createElement("div")
            // var forHeader = document.createElement("div");
            // forHeader.className = "markerText";
            var elementDiv1 = document.createElement("div")
            var elementDiv2 = document.createElement("a")
            elementDiv2.setAttribute("href", link)
            elementDiv2.setAttribute("target", "_blank")
            var journal_name = "Journal:  " + journal
            var place_name = "Place:  " + place
            var title_name = title
            setInnerText(forJournal, journal_name)
            setInnerText(elementDiv1, place_name)
            setInnerText(elementDiv2, title_name)
            // forHeader.appendChild(forJournal);
            // forHeader.appendChild(elementDiv1);
            // content.appendChild(forHeader);
            // content.appendChild(elementDiv2);
            each_data.appendChild(elementDiv2)
            each_data.appendChild(forJournal)
            each_data.appendChild(elementDiv1)
            content.appendChild(each_data)
        })
    }

    function setInnerText(element, text) {
        if (typeof element.textContent == "string") {
            element.textContent = text
        } else {
            element.innerText = text
        }
    }

    layerVetor.on("click", function (evt) {
        var geometry = evt.Feature
        console.log(geometry)
    })

    map.on("click", function (evt) {
        popup.setPosition(undefined)
        closer.blur()
        // return false
        var coordinate = evt.coordinate

        var feature = map.forEachFeatureAtPixel(evt.pixel, function (
            feature,
            layerVetor
        ) {
            return feature
        })

        var all_data = feature.getProperties().features

        // console.log(feature.getProperties().features.length)
        // console.log(feature.getProperties().features[0].values_.attribute)
        // var featuer_attr = feature.getProperties().features[0].values_.attribute
        // var featuerInfo = featuer_attr.attribute
        // var featuerLink = featuer_attr.link
        // var featuerPlace = featuer_attr.place
        // console.log(featuerInfo)
        // console.log(featuerLink)

        if (feature) {
            content.innerHTML = ""
            // addFeatrueInfo(featuerInfo, featuerLink, featuerPlace)
            addFeatrueInfo(all_data)
            if (popup.getPosition() == undefined) {
                popup.setPosition(coordinate)
            }
        }
    })

    map.on("pointermove", function (e) {
        var pixel = map.getEventPixel(e.originalEvent)
        var hit = map.hasFeatureAtPixel(pixel)
        map.getTargetElement().style.cursor = hit ? "pointer" : ""
    })
}

load_map()