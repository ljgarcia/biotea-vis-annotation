/*jslint node: true */
/*jshint laxbreak: true */
"use strict";
/*
 * Copyright (c) 2014 ebi-uniprot
 * Licensed under the Apache 2 license.
 */
var d3 = require('d3');
var _ = require('underscore');
var RDFLoader = require('./RDFLoader');
var Model = require('./BiolinksModel');
require('d3.layout.cloud-browserify');

/**
 * Private Methods
 */
var defaultOpts = {
    width: 600,
    height: 400
};

/*
 * Public Methods
 */
var AnnotationViewer = function(opts){
    var viewer = this;
    viewer.options = _.extend({}, defaultOpts, opts);
    var fill = d3.scale.category20();

    viewer.load = function(path, id) {
        var loader = RDFLoader.get(path + id);
        loader.done(function(loadedData) {
            viewer.data = loadedData.data;
            var maxSize = _.max(viewer.data, function(d) {
                    return d.tfidf;
                });
                var minSize = _.min(viewer.data, function(d) {
                        return d.tfidf;
                    });
                var fontScale = d3.scale.linear()
                    .domain([minSize.tfidf, maxSize.tfidf])
                    .range([5, 30]);

            d3.layout.cloud().size([viewer.options.width, viewer.options.height])
                  .words(viewer.data)
                  .rotate(0)
                  .fontSize(function(d) { return fontScale(d.tfidf); })
                  .text(function(d) { return d.term + ' (' + d.cui + ')'})
                  .on("end", draw)
                  .start();
        }).fail( function(e) {
            d3.select(viewer.options.el)
                .text(e.responseText);
        });
    };


    var draw = function(data) {
        d3.select(viewer.options.el).selectAll('*').remove();
        d3.select(viewer.options.el).append("svg")
                .attr("width", viewer.options.width)
                .attr("height", viewer.options.height)
            .append("g")
                .attr("transform", "translate(" + viewer.options.width/2 + "," + viewer.options.height/2 + ")")
            .selectAll("text")
                .data(viewer.data)
            .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d) {
                    var index = Model.getIndex(d.group);
                    return index === -1 ? 'black': fill(index);
                })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                   return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .attr("title", function(d) {
                    return ('Concept: ' + d.text + ', Type: ' + d.sty
                        + ', Group: ' + d.group + ', tf-idf: ' + d.tfidf);
                })
            .text(function(d) { return d.term; })
        ;
    };

    if (viewer.options.path && viewer.options.id) {
        viewer.load(viewer.options.path, viewer.options.id);
    }
};

module.exports = AnnotationViewer;