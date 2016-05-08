/*jslint node: true */
/*jshint laxbreak: true */
"use strict";
/*
 * Copyright (c) 2015 ljgarcia
 * Licensed under the Apache 2 license.
 */
var d3 = require('d3');
var _ = require('underscore');
var BiolinksParser = require('biotea-io-parser');
var Tooltip = require('biotea-vis-tooltip');
require('d3.layout.cloud-browserify');

/**
 * Private Methods
 */
var defaultOpts = {
    width: 600,
    height: 400,
    filter: [],
    highlightedTermsId: [],
    maxTerms: 100
};

/*
 * Public Methods
 */
var AnnotationViewer = function(opts){
    var viewer = this;
    viewer.options = _.extend({}, defaultOpts, opts);
    viewer.parser = new BiolinksParser();

    var initCloud = function(viewer) {
        if (viewer.options.filter.length !== 0) {
            viewer.data = _.filter(viewer.data, function(d) {
                return _.contains(viewer.options.filter, d.group);
            });
        }

        if (viewer.options.maxTerms) {
            _.sortBy(viewer.data, function(datum) {
                return datum.tf * datum.idf;
            });
            viewer.data = _.first(viewer.data, viewer.options.maxTerms);
        }

        var maxSize = _.max(viewer.data, function(d) {
                return d.tf * d.idf;
        });
        var minSize = _.min(viewer.data, function(d) {
            return d.tf * d.idf;
        });

        var fontScale = d3.scale.linear()
            .domain([minSize.tf * minSize.idf, maxSize.tf * maxSize.idf])
            .range([12, 32]);

        d3.layout.cloud().size([viewer.options.width, viewer.options.height])
              .words(viewer.data)
              .rotate(0)
              .fontSize(function(d) { return fontScale(d.tf * d.idf); })
              .text(function(d) { return d.term[0] + ' (' + d.cui + ')'})
              .on("end", draw)
              .start();
    };

    viewer.loadURL = function(path, id) {
        var loader = viewer.parser.loadAnnotations(path, id);
        loader.done(function(loadedData) {
            viewer.data = loadedData.data;
            initCloud(viewer);
        }).fail( function(e) {
            console.log(e.responseText);
            d3.select(viewer.options.el).text('There was an error loading the annotation, '
                + 'is the file ' + (path+id) + ' available?');
        });
    };

    viewer.loadData = function(data) {
        viewer.data = data;
        initCloud(viewer);
    };

    viewer.setHighlight = function(highlightedTermsId) {
        viewer.options.highlightedTermsId = highlightedTermsId;
        d3.select(viewer.options.el).selectAll('.biotea_annot_show_tooltip')
            .attr("text-decoration", function(d) {
                return _.contains(viewer.options.highlightedTermsId, d.id) ? 'underline' : 'none';
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
                    return viewer.parser.getModel().getGroupColor(d.group);
                })
                .attr("text-decoration", function(d) {
                    return _.contains(viewer.options.highlightedTermsId, d.id) ? 'underline' : 'none';
                })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                   return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .on("mouseover", function(d) {
                    Tooltip.create(d3.select(viewer.options.el), 'Group ' + d.group,
                        [['Terms', d.term.join(', ')], ['Concept ID', d.cui], ['Type', d.type],
                        ['Frequency', d.tf], ['idf', d.idf], ['tf-idf', d.tf * d.idf]]);
                })
                .on("mouseout", function(d) {
                    Tooltip.remove();
                })
                .text(function(d) {
                    return d.term[0];
                })
        ;
    };

    if (viewer.options.path && viewer.options.id) {
        viewer.loadURL(viewer.options.path, viewer.options.id);
    } else if (viewer.options.data) {
        viewer.loadData(viewer.options.data);
    } else {
        d3.select(viewer.options.el).text('No path or identifier provided in the input, '
            + 'visualization is not possible');
    }
};

module.exports = AnnotationViewer;
