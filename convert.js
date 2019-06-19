var Jimp = require('jimp');

var range = ( from, to ) => {
    var res = [];
    for ( var i = from; i <= to; i++ ) res.push( i );
    return res;
}

var THRESHOLD = 128;

var sub = ( p0, p1 ) => [
    p0[ 0 ] - p1[ 0 ],
    p0[ 1 ] - p1[ 1 ]
];
var distSq = ( p0, p1 ) => {
    var [ dx, dy ] = sub( p0, p1 );
    return dx * dx + dy * dy;
}
var dist = ( p0, p1 ) => Math.sqrt( distSq( p0, p1 ) );
var angle = ( p0, p1 ) => {
    var [ x, y ] = sub( p0, p1 );
    return Math.atan2( y, x );
}
var angleToInt = angle => ( angle + Math.PI ) / ( Math.PI * 2 ) * 255;

var convert = async ( inFile, outFile ) => {
    var img = await Jimp.read( inFile );
    var out = img.clone();
    var value = p => img.bitmap.data[ img.getPixelIndex( p[ 0 ], p[ 1 ] ) ]
    var pxAtRadius = ( p, r ) => {
        if ( r === 0 ) return [ p ];
        return [
            ...range( p[ 0 ] - r, p[ 0 ] + r ).reduce( ( res, x ) => [
                ...res,
                [ x, p[ 1 ] - r ],
                [ x, p[ 1 ] + r ],
            ], [] ),
            ...range( ( p[ 1 ] - r ) + 1, ( p[ 1 ] + r ) - 1 ).reduce( ( res, y ) => [
                ...res,
                [ p[ 0 ] - r, y ],
                [ p[ 0 ] + r, y ]
            ], [] )
        ].filter( ([ x, y ]) => (
            x >= 0 &&
            y >= 0 && 
            x < img.bitmap.width &&
            y < img.bitmap.height
        ))
    }
    var find = ( p, d = 0 ) => {
        var coords = pxAtRadius( p, d );
        if ( !coords.length ) return { distance: 0, angle: 0 };
        var found = coords.filter( p => value( p ) < THRESHOLD );
        if ( !found.length ) return find( p, d + 1 );
        var closest = found.reduce( ( min, px ) => {
            return distSq( min, p ) < distSq( px, p ) ? min : px;
        });
        return { distance: dist( p, closest ), angle: angle( p, closest ) };
    }
    img.scan( 0, 0, img.bitmap.width, img.bitmap.height, ( x, y, idx ) => {
        var { distance, angle } = find([ x, y ]);
        console.log( x, y );
        out.setPixelColor( Jimp.rgbaToInt( distance, angleToInt( angle ), 0, 255 ), x, y );
    });
    out.write( outFile );
}

var [ , , inFile, outFile ] = process.argv;
convert( inFile, outFile );