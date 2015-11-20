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
require('d3.layout.cloud-browserify');

/**
 * Private Methods
 */
var defaultOpts = {
    db: 'pmc',
    path: './data/',
    width: 800,
    height: 800
};

/*
 * Public Methods
 */
var AnnotationViewer = function(opts){
    var viewer = this;
    viewer.options = _.extend({}, defaultOpts, opts);

    var loader = RDFLoader(viewer);
    var getter = loader.get(viewer.options.path + viewer.options.id);
    getter.done(function(d) {
        d3.layout.cloud().size([viewer.options.width, viewer.options.height])
              .words(viewer.data)
              .rotate(function() { return ~~(Math.random() * 2) * 90; })
              .font("Impact")
              .fontSize(function(d) {return d.size;})
              .on("end", draw)
              .start();
    }).fail( function(e) {
        d3.select(viewer.options.el)
            .text(e.responseText);
    });

    var fill = d3.scale.category20();

    var draw = function(data) {
        d3.select(viewer.options.el).append("svg")
                .attr("width", viewer.options.width)
                .attr("height", viewer.options.height)
            .append("g")
                .attr("transform", "translate(" + viewer.options.width/2 + "," + viewer.options.height/2 + ")")
            .selectAll("text")
                .data(viewer.data)
            .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .style("fill", function(d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                   return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .attr("title", function(d) {
                    return ('Concept: ' + d.text + ', Type: ' + d.sty
                        + ', Group: ' + d.group + ', tf-idf: ' + d.size);
                })
            .text(function(d) { return d.text; })
        ;
        console.log(viewer.data);
    };
};

module.exports = AnnotationViewer;