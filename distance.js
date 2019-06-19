module.exports = ( curves, px ) => {
    var closestPoints = curves.map( curve => curve.project( px ) )
    var offsets = closestPoints.map( point => ({ x: point.x - px.x, y: point.y - px.y }) );
    var distances = offsets.map( v => v.x * v.x + v.y * v.y );
    var closestIdx = closestPoints.reduce( ( min, point, i ) =>
        distances[ i ] < distances[ min ] ? i : min
    , 0 )
    var offset = offsets[ closestIdx ];
    return Math.sqrt( offset.x ** 2 + offset.y ** 2 )
}