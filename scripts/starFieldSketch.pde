/// 3D Starfield

int numstars=400;
final int SPREAD=64;
int CX,CY;
final float SPEED=1.9;
color bG = color(0, 0, 0);

Star[] s = new Star[numstars];

void setup(){
  size(512,512);
  colorMode(RGB,255);
  noStroke();
  frameRate(60);
  CX=width/2 ; CY=height/2;
 /// s = new Star[numstars];
  for(int i=0;i<numstars;i++){
    s[i]=new Star();
    s[i].SetPosition();
  }
}

window.setStarfieldBG = function(bgColor){
  bG = bgColor;
}; 

window.getStarfieldBG = function(){
  return bG;
}; 

void draw(){
  background(bG);
  for(int i=0;i<numstars;i++){
    s[i].DrawStar();
  }
}

class Star { 
  float x=0,y=0,z=0,sx=0,sy=0;
  void SetPosition(){
    z=(float) random(200,255);
    x=(float) random(-1000,1000);
    y=(float) random(-1000,1000);
  }
  void DrawStar(){
    if (z<SPEED){
	this.SetPosition();
    }
    z-=SPEED;
    sx=(x*SPREAD)/(z)+CX;
    sy=(y*SPREAD)/(4+z)+CY;
    if (sx<0 | sx>width){
	this.SetPosition();
    }
    if (sy<0 | sy>height){
	this.SetPosition();
    }
    fill(color(255 - (int) z,255 - (int) z,255 - (int) z));
    rect( (int) sx,(int) sy,2,3);
  }
}

