var rollup = require('rollup');
var path = require('path');

module.exports = function() {
    var callback = this.async();

    rollup.rollup({
        entry: this.resourcePath
    })
    .then(function(bundle) {
        
        var result = bundle.generate({
            format: 'cjs'
        });
        
        callback(null, result.code);
    })
    .catch(function(err) {
        callback(err);
    })
}