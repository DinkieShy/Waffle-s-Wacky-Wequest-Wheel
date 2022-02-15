var STUFF_TO_DRAW = [];
var CAN;
var CTX;
var CENTER;
const FPS = 60;
var OVERLAY;
var OVERLAY_CTX;

const audioCount = 64;

const audio = new Audio('assets/click.mp3');
var audioSources = [];
var audioIndex = 0;

// const colourCycle = [
// 	"#FFD1D1",
// 	"#FBFFDE",
// 	"#D7FDDF",
// 	"#E0FFFD",
// 	"#D0D0FE",
// 	"#F9DEFF"
// ];

const colourCycle = [
	"#F7F7F7",
	"#CDCDCD",
	"#A8E9FF"

]

var colourIndex = 0;

$(document).ready(function(){
	console.log("init");

	OVERLAY = $("#wheelOverlay")[0];
	CAN = $("#wheel")[0];

	sizeCanvas();

	OVERLAY_CTX = OVERLAY.getContext("2d");
	CTX = CAN.getContext("2d");
	CTX.font = "30pt Monospace";

	var wheel = new Wheel()
	STUFF_TO_DRAW.push(wheel);

	setInterval(draw, 1000/FPS);

	for(var i = 0; i < audioCount; i++){
		audioSources.push(audio.cloneNode());
	}

	for(audioSource of audioSources){
		audioSource.load();
		audioSource.volume = 0.15;
	}
});

$(window).resize(function(){
	sizeCanvas();
});

function sizeCanvas(){
	var canvasArea = $("#contentArea");
	CAN.width = canvasArea.width();
	CAN.height = canvasArea.height();
	OVERLAY.width = canvasArea.width();
	OVERLAY.height = canvasArea.height();
	CENTER = [CAN.width*0.35, CAN.height/2]
}

function draw(){
	for(object of STUFF_TO_DRAW){
		object.draw(CTX);
	}
}

function playTick(){
	audioSources[audioIndex].play();
	audioIndex += 1;
	audioIndex = audioIndex % audioCount;
}

class Wheel{
	constructor(){
		this.rotation=0;
		this.items = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
		this.sep = (Math.PI*2)/this.items.length;
		this.speed = 0;
		this.braking = 0.99;
		this.brakingTime = 3000;
		this.started;
		this.startBraking;
		this.cutoff = 0.01;
		this.lastRotationCheck = 0;
		this.hasEnded = true;
	}

	draw(ctx, overlay = -1){
		this.rotate();

		if(this.rotation % this.sep < this.lastRotationCheck){
			playTick();
		}
		this.lastRotationCheck = this.rotation % this.sep;

		ctx.fillStyle = "white";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(CENTER[0], CENTER[1], CENTER[1]*0.8, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();

		ctx.lineWidth = 2;
		for(var i = this.rotation; i <= Math.PI*2 + this.rotation; i += this.sep){
			ctx.fillStyle = colourCycle[colourIndex];
			colourIndex += 1;
			colourIndex = colourIndex % colourCycle.length;
			ctx.beginPath();
			ctx.arc(CENTER[0], CENTER[1], CENTER[1]*0.8, i, i+this.sep);
			ctx.lineTo(CENTER[0], CENTER[1]);
			ctx.fill();
		}
		colourIndex = 0;

		ctx.save();
		ctx.translate(CENTER[0], CENTER[1]);
		ctx.rotate(-1*(this.sep/2-0.125) + this.rotation);
		ctx.fillStyle = "white";
		ctx.lineWidth = 1;
		ctx.textAlign = "center";

		for(var item of this.items){
			ctx.fillText(item, CENTER[1]*0.25, 0);
			ctx.strokeText(item, CENTER[1]*0.25, 0);
			ctx.rotate(-this.sep);
		}

		ctx.restore();

		ctx.fillStyle = "black";

		var point = [CENTER[0]+CENTER[1]*0.8-10, CENTER[1]]

		ctx.beginPath();
		ctx.moveTo(point[0], point[1]);
		ctx.lineTo(point[0]+40, point[1]+20);
		ctx.lineTo(point[0]+40, point[1]-20);
		ctx.lineTo(point[0], point[1]);
		ctx.fill();
	}

	spin(){
		this.hasEnded = false;
		this.speed = 5 + (Math.random()-0.5) * 5;
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
			if(!this.hasEnded){
				this.end();
			}
		}
	}

	end(){
		this.hasEnded = true;
		console.log(Math.floor(this.rotation/this.sep));
	}
}