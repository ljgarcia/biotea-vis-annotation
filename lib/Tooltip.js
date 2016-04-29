/*jslint node: true */
/*jshint laxbreak: true */
"use strict";
/*
 * Copyright (c) 2015 ljgarcia
 * Licensed under the Apache 2 license.
 */

var d3 = require('d3');

var Tooltip = function(container, datum){
    d3.select('.biotea_annot_tooltip').remove();

    var tooltipContainer = container.append("div")
        .attr("class", "biotea_annot_tooltip");

    tooltipContainer
        .style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY) + 'px')
        .transition(200)
        .style('opacity', 1)
        .style('display','block');

    var table = tooltipContainer.append('table').classed('biotea_annot_tooltip_table', true);

    var headRow = table.append('tr').classed('biotea_annot_tooltip_header', true);
    headRow.append('th').text('Group');
    headRow.append('th').text(datum.group);

    var rowTerm = table.append('tr').classed('biotea_annot_tooltip_body', true);
    rowTerm.append('td').text('Terms');
    rowTerm.append('td').text(datum.term.join(', '));

    var rowCui = table.append('tr').classed('biotea_annot_tooltip_body', true);
    rowCui.append('td').text('Concept ID');
    rowCui.append('td').text(datum.cui);

    var rowType = table.append('tr').classed('biotea_annot_tooltip_body', true);
    rowType.append('td').text('Type');
    rowType.append('td').text(datum.type);

    var rowTFIDF = table.append('tr').classed('biotea_annot_tooltip_body', true);
    rowTFIDF.append('td').text('Frequency');
    rowTFIDF.append('td').text(datum.tf);

    var rowTFIDF = table.append('tr').classed('biotea_annot_tooltip_body', true);
    rowTFIDF.append('td').text('idf');
    rowTFIDF.append('td').text(datum.idf);

    var rowTFIDF = table.append('tr').classed('biotea_annot_tooltip_body', true);
    rowTFIDF.append('td').text('tf-idf');
    rowTFIDF.append('td').text(datum.tf * datum.idf);
};

module.exports = Tooltip;