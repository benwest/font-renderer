var distance = require('./distance');

var easeInCirc = t => Math.sqrt( 1 - t * t ) - 1;

module.exports = ( curves, x, y, size ) => {
    var d = 1 - Math.min( distance( curves, { x, y } ), size ) / size;
    return easeInCirc( d ) * size;
}