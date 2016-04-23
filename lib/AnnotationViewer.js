/*jslint node: true */
/*jshint laxbreak: true */
"use strict";
/*
 * Copyright (c) 2015 ljgarcia
 * Licensed under the Apache 2 license.
 */
var d3 = require('d3');
var _ = require('underscore');
var RDFLoader = require('./RDFLoader');
var Model = require('./BiolinksModel');
var Tooltip = require('./Tooltip');
require('d3.layout.cloud-browserify');

/**
 * Private Methods
 */
var defaultOpts = {
    width: 600,
    height: 400,
    translation: 0
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

            if (viewer.options.filter) {
                viewer.data = _.filter(viewer.data, function(datum) {
                    return _.contains(viewer.options.filter, datum.id);
                });
            }

            var maxSize = _.max(viewer.data, function(d) {
                    return d.tfidf;
            });
            var minSize = _.min(viewer.data, function(d) {
                    return d.tfidf;
                });
            var fontScale = d3.scale.linear()
                .domain([minSize.tfidf, maxSize.tfidf])
                .range([7, 30]);

            d3.layout.cloud().size([viewer.options.width, viewer.options.height])
                  .words(viewer.data)
                  .rotate(0)
                  .fontSize(function(d) { return fontScale(d.tfidf); })
                  .text(function(d) { return d.term[0] + ' (' + d.cui + ')'})
                  .on("end", draw)
                  .start();
        }).fail( function(e) {
            console.log(e.responseText);
            d3.select(viewer.options.el).text('There was an error loading the annotation, '
                + 'is the file ' + (path+id) + ' available?');
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
                .classed('biotea_annot_show_tooltip', true)
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d) {
                    var index = Model.getIndex(d.group);
                    return index === -1 ? 'black': fill(index);
                })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                   return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .on("mouseover", function(d) {
                    new Tooltip(d3.select(viewer.options.el), d, viewer.options.translation);
                })
                .on("mouseout", function(d) {
                    var tooltipContainer = d3.select('.biotea_annot_tooltip');
                    tooltipContainer.transition(20)
                        .style('opacity',0)
                        .style('display','none');
                    tooltipContainer.remove();
                })
                .text(function(d) {
                    return d.term[0];
                })
        ;
    };

    if (viewer.options.path && viewer.options.id) {
        viewer.load(viewer.options.path, viewer.options.id);
    } else {
        d3.select(viewer.options.el).text('No path or identifier provided in the input, '
            + 'visualization is not possible');
    }
};

module.exports = AnnotationViewer;
