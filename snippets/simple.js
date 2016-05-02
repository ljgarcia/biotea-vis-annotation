// if you don't specify a html file, the sniper will generate a div
var appDiv = document.createElement('div');
yourDiv.appendChild(appDiv);

var app = require("biotea-vis-annotation");
var instance = new app({
    el: appDiv,
    path: 'http://localhost:9090/snippets/data/',
    id: 1669719,
    highlightedTermsId: ['umls:C0030664'],
    filter: ['ANAT', 'GENE', 'GNPT', 'TAXA', 'PHYS', 'OCCU']
});