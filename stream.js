var fs = require('fs');
var { Readable } = require('stream');
var PNGEncoder = require('png-stream/encoder');

class FragmentStream extends Readable {
    constructor ( options, fragment ) {
        super( options );
        this.fragment = fragment;
    }
    _read ( size ) {
        
    }
}

var render = ( width, height, fn ) => {
    var pixels = new Readable();
    pixels
        .pipe( new PNGEncoder( width, height, { colorSpace: 'rgba' } ) )
        .pipe( fs.createWriteStream( 'out.png' ) )
    for ( var y = 0; y < height; y++ ) {
        for ( var x = 0; x < width; x++ ) {
            var [ r, g, b, a ] = fn( x, y );
            pixels.push( new Buffer([ r, g, b, a ]) );
            // pixels.push( g );
            // pixels.push( b );
            // pixels.push( a );
        }
    }
    pixels.push( null );
}

render( 10, 10, ( x, y ) => [ 255, 0, 0, 255 ] );