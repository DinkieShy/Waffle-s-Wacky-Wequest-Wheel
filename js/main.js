var STUFF_TO_DRAW = [];
var CAN;
var CTX;
var CENTER;
const FPS = 60;

$(document).ready(function(){
	console.log("init");
	CAN = $("#wheel")[0];
	sizeCanvas();
	CTX = CAN.getContext("2d");

	var wheel = new Wheel()
	STUFF_TO_DRAW.push(wheel);

	setInterval(draw, 1000/60);
});

$(window).resize(function(){
	sizeCanvas();
});

function sizeCanvas(){
	var canvasArea = $("#contentArea");
	CAN.width = canvasArea.width();
	CAN.height = canvasArea.height();
	CENTER = [CAN.width/2, CAN.height/2]
}

function draw(){
	for(object of STUFF_TO_DRAW){
		object.draw(CTX);
	}
}

class Wheel{
	constructor(){
		this.rotation=0;
		this.items = [];
		this.sep = Math.PI*2;
		this.speed = 0;
		this.braking = 0.99;
		this.brakingTime = 3000;
		this.started;
		this.startBraking;
		this.cutoff = 0.01;
	}

	draw(ctx){
		this.rotate();

		ctx.fillStyle = "white";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(CENTER[0], CENTER[1], CENTER[1]*0.8, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();

		ctx.lineWidth = 2;
		for(var i = this.rotation; i <= Math.PI*2 + this.rotation; i += this.sep){
			ctx.beginPath();
			ctx.arc(CENTER[0], CENTER[1], CENTER[1]*0.8, i, i+this.sep);
			ctx.lineTo(CENTER[0], CENTER[1]);
			ctx.stroke();
		}
	}

	spin(){
		this.speed = Math.random() * 30;
		this.started = Date.now();
		this.startBraking = this.started + this.brakingTime + (0.5+Math.random())*this.brakingTime
		console.log(this.speed);
	}

	rotate(){
		this.rotation = (this.rotation + this.speed/(1000/FPS)) % (Math.PI*2);
		if(this.speed > this.cutoff && Date.now() >= this.startBraking){
			this.speed *= this.braking;
		}
		else if(this.speed < this.cutoff){
			this.speed = 0;
		}
	}
}