precision highp float;

uniform sampler2D map;
uniform vec2 size;

void main () {
    vec2 p = gl_FragCoord.xy / size;
    p.y = 1. - p.y;
    // vec4 tex = 
    gl_FragColor = texture2D( map, p ) * vec4( 20., 20., 20., 1. );
}