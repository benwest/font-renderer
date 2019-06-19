var Jimp = require('jimp');
var glyphs = require('./glyphs');
var createCurves = require('./curves');
var bevel = require('./bevel');

var normal = ( x, y, depthMap ) => {
    var dzdx = ( depthMap( x + 1, y ) - depthMap( x - 1, y ) ) / 2;
    var dzdy = ( depthMap( x, y + 1 ) - depthMap( x, y - 1 ) ) / 2;
    var direction = { x: -dzdx, y: -dzdy, z: 1 };
    var magnitude = Math.sqrt( direction.x ** 2 + direction.y ** 2 + direction.z ** 2 );
    return { x: direction.x / magnitude, y: direction.y / magnitude, z: direction.z / magnitude };
}

var floatToInt = x => Math.floor( ( x * .5  + .5 ) * 255 );
var vectorToInt = v => Jimp.rgbaToInt( floatToInt( v.x ), floatToInt( v.y ), floatToInt( v.z ), 255 );

var renderMask = async ( width, height, mask, render ) => {
    var out = await new Jimp( width, height );
    out.scan( 0, 0, width, height, ( x, y ) => {
        if ( mask.getPixelColor( x, y ) < 0xffffffff ) {
            out.setPixelColor( Jimp.rgbaToInt( 0, 0, 0, 0 ), x, y );
        } else {
            out.setPixelColor( vectorToInt( render( x, y ) ), x, y );
        }
    })
    return out;
}

var fontSize = 2000;
var bevelSize = fontSize / 20;

;( async () => {
    for ( var glyph of glyphs ) {
        if ( !glyph.unicode ) continue;
        var { size, curves } = createCurves( glyph, fontSize );
        if ( size.x === 0 || size.y === 0 ) continue;
        console.log( glyph.name );
        var mask = await Jimp.read(`out/mask/${ glyph.unicode }.png`)
        var norm = await renderMask( size.x, size.y, mask, ( x, y ) => normal( x, y, ( x, y ) => bevel( curves, x, y, bevelSize ) ) );
        await norm.writeAsync( `out/normal2/${ glyph.unicode }.png` );
    }
})()


// Math.easeOutCirc = function (t, b, c, d) {
// 	t /= d;
// 	t--;
// 	return c * Math.sqrt(1 - t*t) + b;
// };

