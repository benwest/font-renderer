var Bezier = require('bezier-js')

var translate = ( curve, d ) => new Bezier( ...curve.points.map(
    ({ x, y }) => ({ x: x + d.x, y: y + d.y })
));

var Line = ( x0, y0, x1, y1 ) => new Bezier(
    x0, y0,
    ( x0 + x1 ) / 2, ( y0 + y1 ) / 2,
    x1, y1
)

var createShape = commands => {
    if ( !commands.length ) return [];
    var from = { x: commands[ 0 ].x, y: commands[ 0 ].y };
    var shape = []
    for ( var cmd of commands.slice( 1 ) ) {
        switch ( cmd.type ) {
            case 'L':
                shape.push( Line(
                    from.x, from.y,
                    cmd.x, cmd.y
                ));
                from.x = cmd.x;
                from.y = cmd.y;
                break;
            case 'C':
                shape.push( new Bezier(
                    from.x, from.y,
                    cmd.x1, cmd.y1,
                    cmd.x2, cmd.y2,
                    cmd.x, cmd.y
                ));
                from.x = cmd.x;
                from.y = cmd.y;
                break;
            case 'Q':
                shape.push( new Bezier(
                    from.x, from.y,
                    cmd.x1, cmd.y1,
                    cmd.x, cmd.y
                ));
                from.x = cmd.x;
                from.y = cmd.y;
                break;
            case 'Z':
                shape.push( Line(
                    from.x, from.y,
                    commands[ 0 ].x, commands[ 0 ].y
                ));
                break;
        }
    }
    return shape;
}

var createShapes = commands => {
    var currShape = null;
    var shapes = [];
    for ( var cmd of commands ) {
        if ( cmd.type === 'M' ) {
            if ( currShape ) shapes.push( createShape( currShape ) );
            currShape = [ cmd ];
        } else {
            currShape.push( cmd );
        }
    }
    if ( currShape ) shapes.push( createShape( currShape ) );
    return shapes;
}

module.exports = ( glyph, size ) => {
    var path = glyph.getPath( 0, 0, size );
    var bounds = path.getBoundingBox();
    var size = { x: bounds.x2 - bounds.x1, y: bounds.y2 - bounds.y1 };
    var offset = { x: -bounds.x1, y: -bounds.y1 };
    var shapes =
        createShapes( path.commands )
        .map( shape => shape.map( curve => translate( curve, offset )))
    var curves = shapes.reduce( ( a, b ) => a.concat( b ), [] )
    return { size, shapes, curves };
}