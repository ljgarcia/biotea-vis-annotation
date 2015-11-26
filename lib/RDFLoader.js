var jQuery = require('jquery');
var _ = require('underscore');
var Model = require('./BiolinksModel');

var findTopic = function(graph, cui) {
    return _.find(graph, function(elem) {
        return elem['@id'] === cui ? elem : undefined;
    });
};

var findGroup = function(sty) {
    var group = undefined;
    var result = _.find(Model.model, function(myTypes, key) {
        group = key;
        return _.contains(myTypes, sty);
    });
    return result ? group : undefined;
};

var RDFLoader = function() {
    return {
        get: function(path) {
            return jQuery.ajax({
                url: path + '.json',
                dataType: 'json'
            }).done(function(d) {
                d.data = [];
                _.each(d['@graph'], function(elem) {
                    if (elem['@type'] === 'ao:Annotation') {
                        var topic = findTopic(d['@graph'], elem.hasTopic);
                        var cui = topic ? topic['umls:cui'] : undefined;
                        var sty = topic ? topic['umls:tui'] : undefined;
                        var group = sty ? findGroup(sty) : undefined;
                        var tfidf = +elem['biotea:idf'] * +elem.tf;
                        if (typeof(elem['ao:body']) === 'string') {
                            d.data.push({tfidf: tfidf,cui: cui, sty: sty, group: group, term: elem['ao:body']});
                        } else {
                            _.each(elem['ao:body'], function(body) {
                                d.data.push({tfidf: tfidf, cui: cui, sty: sty, group: group, term: body});
                            });
                        }
                    }
                });
                return d;
            }).fail(function(e) {
               return e;
            });
        }
    };
}();

module.exports = RDFLoader;