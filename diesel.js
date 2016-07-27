//MAIN CONSTANTS
var CANVAS;
var CONTEXT;

var CURRENT_STATE = new State();

var WIDTH;
var HEIGHT;

var GAME_UPDATE_EXT_FUNC = function() {};
var MOUSE_UPDATE_EXT_FUNC = function() {};

var BUTTON_NORMAL = "res/button/normal.png";
var BUTTON_HOVER = "res/button/hover.png";
var BUTTON_CLICKED = "res/button/click.png";
var BUTTON_DISABLED = "res/button/disabled.png";

var MOUSE_POS = new Vec2(0, 0);

var MOUSE_DOWN = false;
var FIRST_MOUSE_DOWN = false;

var EXTERNAL_METHODS = [];

var REC_ANIM;
var REC_PRESET;

var DELTA_TIME = 0;

var KEYS_DOWN = [];
var KEYS_FIRST_DOWN = [];

var lastFrame = 0;

var CameraPos = new Vec2(0, 0);
var ViewScale = new Vec2(1, 1);

//MAIN FUNCTIONS
function Init()
{
    canvas = document.getElementById("main-canvas");
    context = canvas.getContext("2d");
    canvas.style.cursor = "default";
    
    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', Resize_Canvas, false);
    
    Resize_Canvas();
    
    canvas.addEventListener('mousemove', function(evt) {
        MOUSE_POS = new Vec2(evt.clientX - canvas.getBoundingClientRect().left, evt.clientY - canvas.getBoundingClientRect().top);
        MOUSE_POS.x -= WIDTH/2;
        MOUSE_POS.y -= HEIGHT/2;
    }, false);
    
    canvas.addEventListener('mousedown', function(evt) {
        FIRST_MOUSE_DOWN = !MOUSE_DOWN;
        MOUSE_DOWN = true;
    }, false);
    
    canvas.addEventListener('mouseup', function(evt) {
        MOUSE_DOWN = false;
        FIRST_MOUSE_DOWN = false;
    }, false);
    
    window.addEventListener('keydown', function(evt) { PROCESS_KEY_INPUT_DOWN(evt.keyCode); }, false);
    window.addEventListener('keyup', function(evt) { PROCESS_KEY_INPUT_UP(evt.keyCode); }, false);
	
	window.addEventListener('contextmenu', function(ev) { ev.preventDefault(); return false; }, false);	
    
    lastFrame = new Date().getTime();
}

function Loop() {
    DELTA_TIME = (new Date().getTime() - lastFrame)/1000.0;
    lastFrame = new Date().getTime();
    Resize_Canvas();
    FIRST_MOUSE_DOWN = false;
}

function Resize_Canvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
	
	WIDTH = canvas.width;
	HEIGHT = canvas.height;
	
    CURRENT_STATE.updateFunc();
	GAME_UPDATE_EXT_FUNC();
    Render();
}

function Render()
{
    //context.transform(1, 0, 0, -1, 0, HEIGHT); 
    //camera
    //context flags
    context.imageSmoothingEnabled = true;
    //clear
    context.clearRect(0, 0, WIDTH, HEIGHT);
    //render
	context.translate(WIDTH/2, HEIGHT/2);
    context.scale(1/ViewScale.x, 1/ViewScale.y);
    context.translate(-CameraPos.x, -CameraPos.y);
    
    
	for(var i = 0; i < CURRENT_STATE.sprites.length; i++)
	{
        if(!(Sprite.prototype.isPrototypeOf(CURRENT_STATE.sprites[i]))) { console.error("Object in sprites list is not a sprite."); return; }
        if(CURRENT_STATE.sprites[i].enabled)
        {
            RENDER_SPRITE( CURRENT_STATE.sprites[i] );
        }
	}
    
    for(var i = 0; i < CURRENT_STATE.ui.length; i++)
    {
        var uiObject = CURRENT_STATE.ui[i];
        if(uiObject.visible)
        {
            if(Text.prototype.isPrototypeOf(uiObject))
            {
                context.font = uiObject.font;
                context.fillStyle = uiObject.style;
                context.textAlign = uiObject.centered ? "center" : "left";
				context.globalAlpha = uiObject.opacity;
				context.textBaseline = uiObject.baseline;
                context.fillText(uiObject.text, uiObject.position.x, uiObject.position.y);
				context.globalAlpha = 1;
            } else if(Button.prototype.isPrototypeOf(uiObject))
            {
                //draw button image
                var buttonImg = uiObject.normalImg;

                uiObject.clicked = false;

                if(uiObject.enabled)
                {
                    if(Internal.pointInScreenRect(MOUSE_POS, uiObject.rect))
                    {
                        buttonImg = uiObject.hoveredImg;
                        if(FIRST_MOUSE_DOWN)
                        {
                            uiObject.clicked = true;
                            buttonImg = uiObject.clickedImg;
                        }
                    }
                } else
                {
                    buttonImg = uiObject.disabledImg;
                }

                var img = document.getElementById(buttonImg);

                context.drawImage(img,
                    uiObject.rect.x,
                    uiObject.rect.y,
                    uiObject.rect.width,
                    uiObject.rect.height
                );

                //draw button content
                if(uiObject.contentImg != "")
                {
                    var cimg = document.getElementById(uiObject.contentImg);
                    context.drawImage(cimg,
                        uiObject.rect.x + (uiObject.rect.width/2) - (uiObject.contentImgSize.x/2),
                        uiObject.rect.y + (uiObject.rect.height/2) - (uiObject.contentImgSize.y/2),
                        uiObject.contentImgSize.x,
                        uiObject.contentImgSize.y
                    );
                }

                //draw button text
                context.font = uiObject.textFont;
                context.fillStyle = uiObject.textStyle;
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(uiObject.text, uiObject.rect.x + (uiObject.rect.width/2), uiObject.rect.y + (uiObject.rect.height/2));
            }
        }
    }
}

function RENDER_SPRITE(spr)
{
    if(!(Sprite.prototype.isPrototypeOf(spr))) { console.error("Object in sprites list is not a sprite."); return; }
    
    if(!spr.enabled)
    {
        return;
    }
    
    //var img = document.getElementById(spr.imagePath);
    var img = new Image();
    img.src = spr.imagePath;
    
    var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');
    oc.width = img.width * spr.step;
    oc.height = img.height * spr.step;
    octx.drawImage(img, 0,0, oc.width,oc.height);

    /// step 2
    //octx.drawImage(oc,0,0,oc.width * spr.step,oc.height * spr.step);

    /*
    canvas.width=400;
    canvas.height=150;
    ctx.drawImage(oc,0,0,oc.width * 0.5, oc.height * 0.5,
                     0,0,canvas.width,canvas.height);
    */
    
    context.translate(spr.transform.position.x, spr.transform.position.y);
    context.rotate((Math.PI/180) * spr.transform.rotation);
    
    if(spr.expandType == ExpandType.STRETCH)
    {
        context.drawImage((spr.step != 1 ? oc : img),
            -((spr.size.x/2) * spr.transform.scale.x),
            -((spr.size.y/2) * spr.transform.scale.y),
            spr.size.x * spr.transform.scale.x,
            spr.size.y * spr.transform.scale.y
        );
    } else if(spr.expandType == ExpandType.TILE)
    {
        var original = context.fillStyle;
        var pattern = context.createPattern((spr.step != 1 ? oc : img), 'repeat');
        context.fillStyle = pattern;
        context.fillRect(
            -((spr.size.x/2) * spr.transform.scale.x),
            -((spr.size.y/2) * spr.transform.scale.y),
            spr.size.x * spr.transform.scale.x,
            spr.size.y * spr.transform.scale.y
        );
        context.fillStyle = original;
    }
    
    for(var i = 0; i < spr.children.length; i++)
    {
        RENDER_SPRITE( spr.children[i] );
    }
    
    context.rotate((Math.PI/180) * -spr.transform.rotation);
    context.translate(-spr.transform.position.x, -spr.transform.position.y);
	
    for(var i = 0; i < KEYS_FIRST_DOWN.length; i++)
    {
        KEYS_FIRST_DOWN.splice(i, 1);
    }
}

function PROCESS_KEY_INPUT_DOWN(e)
{
    if(KEYS_DOWN.indexOf(e) == -1)
    {
        KEYS_FIRST_DOWN.push(e);
        KEYS_DOWN.push(e);
    }
}

function PROCESS_KEY_INPUT_UP(e)
{
    if(KEYS_DOWN.indexOf(e) != -1)
    {
        KEYS_DOWN.splice(KEYS_DOWN.indexOf(e), 1);
    }
}

//MAIN API NAMESPACE
var DE = DE || {
    ChangeState: function(state)
    {
        CURRENT_STATE = state;
        CURRENT_STATE.initFunc();
    },
};

DE.Math = DE.Math || {
    //Keeps a vector inside of the desired bounds
    ClampVec: function(vec, rect)
    {
        return new Vec2(Math.min(Math.max(vec.x, rect.x), rect.x + rect.width), Math.min(Math.max(vec.y, rect.y), rect.y + rect.height));
    }
};

//INTERNAL FUNCTIONS
var Internal = Internal || {
    pointInScreenRect: function(pos, rect)
    {
        return pos.x >= rect.x && pos.x <= rect.x + rect.width && pos.y >= rect.y && pos.y <= rect.y + rect.height;
    },
};

//MAIN CLASSES
function State()
{
	this.sprites = [];
    this.ui = [];
    
    var DEF_INIT_FUNC = function() {};
    var DEF_UPDATE_FUNC = function() {};
    
    this.initFunc = DEF_INIT_FUNC;
    this.updateFunc = DEF_UPDATE_FUNC;
}

function Sprite()
{
	this.transform = new Transform();
	this.name = "Sprite";
	this.imagePath = "";
    this.expandType = ExpandType.STRETCH;
	this.size = new Vec2(50, 50);
    this.children = [];
    this.enabled = true;
    this.step = 1;
}

var ExpandType = {
    //stretch to fill size
    STRETCH: 0,
    //tile to fill size
    TILE: 1,
    //stretch but keep original dimensions
    PRESERVE: 2,
}

Sprite.prototype.setImage = function(path)
{
	this.imagePath = path;
	this.size = new Vec2(document.getElementById(path).naturalWidth, document.getElementById(path).naturalHeight);
}

function Transform()
{
	this.position = new Vec2(0, 0);
	this.scale = new Vec2(1, 1);
	this.rotation = 0;
}

function Vec2(x, y)
{
	this.x = x;
	this.y = y;
}

Vec2.prototype.toString = function()
{
	return this.x + "," + this.y;
}

Vec2.parse = function(data)
{
	var spl = data.split(",");
	return new Vec2(Number(spl[0]),Number(spl[1]));
}

Vec2.prototype.isZero = function()
{
	return this.x === 0 && this.y === 0;
}

function Rect(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function Text(position, text)
{
    this.visible = true;
    this.text = text;
    this.position = position;
    this.centered = true;
    this.font = "22px Arial";
    this.style = "black";
	this.opacity = 1;
	this.baseline = "middle";
	this.setFont(f)
	{
	    this.font = f;
	    return this;
	};
	this.setStyle(style)
	{
	    this.style = style;
	    return this;
	};
}

function Button(rect, text)
{
    this.visible = true;
    this.rect = rect;
    this.text = text;
    this.textFont = "22px Arial";
    this.textStyle = "black";
    this.normalImg = BUTTON_NORMAL;
    this.hoveredImg = BUTTON_HOVER;
    this.clickedImg = BUTTON_CLICKED;
    this.disabledImg = BUTTON_DISABLED;
    this.contentImg = "";
    this.contentImgSize = new Vec2(64, 64);
    this.enabled = true;
    this.clicked = false;
}


function KeyCode(c)
{
    return c.charCodeAt(0) - 32;
}

var Input = Input || {
    getKey: function(key)
    {
        return KEYS_DOWN.indexOf(key) != -1;
    },
    getKeyDown: function(key)
    {
        return KEYS_FIRST_DOWN.indexOf(key) != -1;
    },
};

function trunc(string, max)
{
    return (string.length > max ? string.substring(0, max) + "..." : string);
}