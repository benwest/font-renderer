var opentype = require('opentype.js')

var font = opentype.loadSync('./MonumentGroteskTrial-Medium.otf');

var glyphs = [];
for ( var i in font.glyphs.glyphs ) glyphs.push( font.glyphs.glyphs[ i ] );
module.exports = glyphs;