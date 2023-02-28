//----------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                       | |    | |               | | | |                     //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//                                                                            //
//  File      : main.mjs                                                      //
//  Project   : lissajous                                                     //
//  Date      : 14 Dec, 21                                                    //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2021                                                //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//---------------------------------------------------------------------------~//


//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
__SOURCES = [
    "/modules/demolib/modules/external/chroma.js",
    "/modules/demolib/modules/external/gif.js/gif.js",

    "/modules/demolib/source/demolib.js",
];

//------------------------------------------------------------------------------
const BALLS_MAX_RADIUS = 50;
const BALLS_MIN_RADIUS = 10;
const MAX_BALLS        = 20;
const MIN_BALLS        =  2;


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let balls_x       = [];
let balls_y       = [];
let balls_r       = [];
let balls_vel_x   = [];
let balls_vel_y   = [];
let balls_length  = 0;
let offscreen_ctx = null;
let max_width     = 0;
let max_height    = 0;

function hslToRgb(h, s, l)
{
    var r, g, b;
    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [ r * 255, g * 255, b * 255,  255];
}

function canvas_edge_left  () { return -(max_width  * 0.5); }
function canvas_edge_right () { return +(max_width  * 0.5); }
function canvas_edge_top   () { return -(max_height * 0.5); }
function canvas_edge_bottom() { return +(max_height * 0.5); }

//------------------------------------------------------------------------------
function CreateBall()
{
    if(balls_length >= MAX_BALLS) {
        return;
    }

    balls_x    .push(random_int(canvas_edge_left  (), canvas_edge_right()));
    balls_y    .push(random_int(canvas_edge_bottom(), canvas_edge_top  ()));
    balls_r    .push(random_int(BALLS_MIN_RADIUS,    BALLS_MAX_RADIUS ));
    balls_vel_x.push(random_int(-5,                  +5               ));
    balls_vel_y.push(random_int(-5,                  +5               ));

    ++balls_length;
}

//------------------------------------------------------------------------------
function UpdateBall(i, dt)
{
    x     = balls_x    [i];
    y     = balls_y    [i];
    r     = balls_r    [i];
    vel_x = balls_vel_x[i];
    vel_y = balls_vel_y[i];

    //
    // Physics.
    balls_x[i] += (vel_x * dt * 10);
    balls_y[i] += (vel_y * dt * 10);

    //
    // Wrap the balls.
    if(balls_x[i] + r < canvas_edge_left() ||
       balls_x[i] - r > canvas_edge_right())
    {
        balls_vel_x[i] *= -1;
    }

    if(balls_y[i] + r < canvas_edge_top() ||
       balls_y[i] - r > canvas_edge_bottom())
    {
        balls_vel_y[i] *= -1;
    }
}


//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function setup_standalone_mode()
{
    return new Promise((resolve, reject)=>{
        demolib_load_all_scripts(__SOURCES).then(()=> { // Download all needed scripts.
            // Create the standalone canvas.
            const canvas = document.createElement("canvas");

            canvas.width            = window.innerWidth;
            canvas.height           = window.innerHeight;
            canvas.style.position   = "fixed";
            canvas.style.left       = "0px";
            canvas.style.top        = "0px";
            canvas.style.zIndex     = "-100";

            document.body.appendChild(canvas);

            // Setup the listener for gif recording.
            gif_setup_listeners();

            resolve(canvas);
        });
    });
}

//------------------------------------------------------------------------------
function setup_common(canvas)
{
    set_random_seed();
    set_main_canvas(canvas, true);
    install_input_handlers(canvas);

    const balls_count = random_int(MIN_BALLS, MAX_BALLS);
    for(let i = 0; i < balls_count; ++i) {
        CreateBall();
    }

    const v = calculate_offscreen_canvas_max_size(
        get_canvas_width (),
        get_canvas_height(),
        600 * 400
    );

    max_width  = v[0]
    max_height = v[1];

    offscreen_ctx = create_offscreen_context(max_width, max_height, true);
    start_draw_loop(draw);
}



//------------------------------------------------------------------------------
function demo_main(user_canvas)
{
    if(!user_canvas) {
        setup_standalone_mode().then((canvas)=>{
            setup_common(canvas);
        });
    } else {
        canvas = user_canvas;
        setup_common();
    }

}

//------------------------------------------------------------------------------
function draw(dt)
{
    offscreen_ctx.lock_pixels();
    for(let y = 0; y < max_height; ++y) {
        for(let x = 0; x < max_width; ++x) {
            let sum = 0;

            for(let b = 0; b < balls_length; ++b) {
                var ball_x = (max_width  * 0.5 + balls_x[b]);
                var ball_y = (max_height * 0.5 + balls_y[b]);
                var ball_r = balls_r[b];

                let dist  = distance(x, y, ball_x, ball_y);
                let value = (ball_r * 1100 / dist);
                sum += value;
            }

            var final = sum;
            if(final > 360) {
                final %= 360;
            }

            let color = hslToRgb(final / 360.0, 1.0, 0.5);
            offscreen_ctx.set_pixel(x,y, color);
        }
    }
    offscreen_ctx.unlock_pixels();

    for(let i = 0; i < balls_length; ++i) {
        UpdateBall(i, dt);

        balls_x[0] = get_mouse_x() - max_width  * 0.5;
        balls_y[0] = get_mouse_y() - max_height * 0.5;
    }

    get_main_canvas_context().drawImage(
        offscreen_ctx.canvas,
        0, 0,offscreen_ctx.canvas.width, offscreen_ctx.canvas.height,
        0, 0, get_canvas_width(), get_canvas_height()
    );
}
