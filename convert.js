var opentype = require('opentype.js')
var sharp = require('sharp');
var { createCanvas } = require('canvas');
var tmp = require('tmp');

var font = opentype.loadSync('./MonumentGroteskTrial-Medium.otf');

var BLUR = 30;
var Y = 30;

var getSize = glyph => {
    var { x1, x2, y1, y2 } = glyph.getBoundingBox();
    return [ Math.ceil( x2 - x1 ), Math.ceil( y2 - y1 ) ];
}

var drawMask = ( glyph, color = 'white' ) => {
    var [ w, h ] = getSize( glyph );
    var canvas = createCanvas( w, h );
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    var { x1, y1, x2, y2 } = glyph.getBoundingBox();
    var path = glyph.getPath( -x1, y1 + h, font.unitsPerEm );
    path.fill = color;
    path.draw( ctx );
    var pixels = ctx.getImageData( 0, 0, w, h );
    return sharp( Buffer.from( pixels.data ), { raw: { width: pixels.width, height: pixels.height, channels: 4 } })
}

var saveTmp = async img => {
    var file = tmp.tmpNameSync({ postfix: '.png' });
    await img.toFile( file );
    return file;
}

var reload = async img => sharp( await saveTmp( img ) );

( async () => {
    for ( var glyph of Object.values( font.glyphs.glyphs ) ) {
        var size = getSize( glyph );
        if ( !glyph.unicode || size[ 0 ] === 0 || size[ 1 ] === 0 ) continue;
        console.log( glyph.name );
        var mask = drawMask( glyph, 'white' );
        console.log('\tmask done')
        var extend = BLUR * 2;
        var blurSize = [ size[ 0 ] + extend * 2, size[ 1 ] + extend * 2 ];
        var blur = await reload(
            mask
                .clone()
                .extend({
                    top: extend, left: extend, right: extend, bottom: extend,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .blur( BLUR )
        )
        var blurUp = blur.clone().extract({
            left: extend,
            top: extend + Y,
            width: size[ 0 ],
            height: size[ 1 ]
        })
        var blurDown = blur.clone().extract({
            left: extend,
            top: extend - Y,
            width: size[ 0 ],
            height: size[ 1 ]
        })
        var highlight = drawMask( glyph, 'white' )
            .composite([{
                input: await saveTmp( blurUp ),
                blend: 'dest-out'
            }])
        var shadow = drawMask( glyph, 'rgba( 0, 0, 0, .3 )' )
            .composite([{
                input: await saveTmp( blurDown ),
                blend: 'dest-out'
            }])
        var out = ( await reload( shadow ) )
            .composite([{
                input: await saveTmp( highlight )
            }])
        await out.toFile(`./out/${ glyph.unicode }.png`);
    }
})()