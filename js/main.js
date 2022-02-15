var STUFF_TO_DRAW = [];
var CAN;
var CTX;
var CENTER;
const FPS = 60;

var drawInterval;

const audioCount = 256;

const audio = new Audio('assets/click.mp3');
var audioSources = [];
var audioIndex = 0;

var resultsArea;
var outcomeArea;

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
	"#A8E9FF",
	"#8ABBCC"
];

var colourIndex = 0;

$(document).ready(function(){
	console.log("init");

	resultsArea = $("#resultsList")[0];
	outcomeArea = $("#outcomeArea");

	CAN = $("#wheel")[0];

	sizeCanvas();

	CTX = CAN.getContext("2d");
	CTX.textAlign = "right";
	CTX.textBaseline = 'middle';

	var wheel = new Wheel()
	STUFF_TO_DRAW.push(wheel);

	draw();

	for(var i = 0; i < audioCount; i++){
		audioSources.push(audio.cloneNode());
	}

	for(audioSource of audioSources){
		audioSource.load();
		audioSource.volume = 0.15;
	}

	outcomeArea.click(function(){
		STUFF_TO_DRAW[0].spin(true);
	});

	outcomeArea[0].innerHTML = "<h3 class=\"outcome\">Click to spin!</h3>";
});

$(window).resize(function(){
	sizeCanvas();
});

function sizeCanvas(){
	var canvasArea = $("#contentArea");
	CAN.width = canvasArea.width();
	CAN.height = canvasArea.height();
	CENTER = [CAN.width*0.35, CAN.height/2]
}

function draw(){
	CTX.clearRect(0, 0, CAN.width, CAN.height);
	for(object of STUFF_TO_DRAW){
		object.draw(CTX);
	}
}

function playTick(){
	audioSources[audioIndex].play();
	audioIndex += 1;
	audioIndex = audioIndex % audioCount;
}

function parseOutcomeString(string){
	var total = Function('return (' + string + ');')();
	var hours = Math.floor(total / 3600);
	var subtotal = total - 3600 * hours;
	var minutes = Math.floor(subtotal / 60);
	subtotal -= 60 * minutes;
	var seconds = subtotal;

	if(hours > 0){
		return `<h3 class="outcome">${hours} hours</h3>
		<h3 class="outcome">${minutes} minutes</h3>
		<h3 class="outcome">${seconds} seconds</h3>
		<h4 id="instructionText">Click to spin again!</h4>`;
	}
	else if(minutes > 0){
		return `<h3 class="outcome">${minutes} minutes</h3>
		<h3 class="outcome">${seconds} seconds</h3>
		<h4 id="instructionText">Click to spin again!</h4>`;
	}
	else{
		return `<h3 class="outcome">${seconds} seconds</h3>
		<h4 id="instructionText">Click to spin again!</h4>`;
	}
}

class Wheel{
	constructor(){
		this.rotation=0;
		this.items = [
			{"text": "+5 SECONDS", "val": "5+"},
			{"text": "+30 SECONDS", "val": "30+"},
			{"text": "+1 MINUTE", "val": "60+"},
			{"text": "BASE: 1 MINUTE", "val": "60"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "0.5 x ...", "val": "0.5*"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "BASE: 5 MINUTES", "val": "300"},
			{"text": "+5 SECONDS", "val": "5+"},
			{"text": "+30 SECONDS", "val": "30+"},
			{"text": "+1 MINUTE", "val": "60+"},
			{"text": "BASE: 10 MINUTES", "val": "600"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "0.5 x ...", "val": "0.5*"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "BASE: 20 MINUTES", "val": "1200"},
			{"text": "+5 SECONDS", "val": "5+"},
			{"text": "+30 SECONDS", "val": "30+"},
			{"text": "+1 MINUTE", "val": "60+"},
			{"text": "BASE: 45 MINUTES", "val": "2700"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "0.5 x ...", "val": "0.5*"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "BASE: 5 SECONDS", "val": "5"},
			{"text": "+5 SECONDS", "val": "5+"},
			{"text": "+30 SECONDS", "val": "30+"},
			{"text": "+1 MINUTE", "val": "60+"},
			{"text": "BASE: 10 SECONDS", "val": "10"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "0.5 x ...", "val": "0.5*"},
			{"text": "1.5 x ...", "val": "1.5*"},
			{"text": "BASE: 20 SECONDS", "val": "20"}
		];
		this.endStates = [3, 7, 11, 15, 19, 23, 27, 31];
		this.sep = (Math.PI*2)/this.items.length;
		this.speed = 0;
		this.braking = 0.95;
		this.brakingTime = 1000;
		this.started;
		this.startBraking;
		this.cutoff = 0.01;
		this.lastRotationCheck = 0;
		this.hasEnded = true;
		this.results = "";
		this.individualResults = [];
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
		ctx.rotate(-1*(this.sep/2-0.01) + this.rotation);
		ctx.fillStyle = "black";
		ctx.lineWidth = 1;

		for(var item of this.items){
			var fontSize = 30;
			ctx.font = fontSize + "px Monospace";
			while(ctx.measureText(item["text"]).width > CENTER[1]*0.5){
				fontSize--;
				ctx.font = fontSize + "px Monospace";
			}
			ctx.fillText(item["text"], CENTER[1]*0.79, 0, CENTER[1]*0.5);
			ctx.rotate(-this.sep);
		}

		ctx.restore();

		ctx.fillStyle = "black";

		var point = [CENTER[0]+CENTER[1]*0.8-10, CENTER[1]];

		ctx.beginPath();
		ctx.moveTo(point[0], point[1]);
		ctx.lineTo(point[0]+40, point[1]+20);
		ctx.lineTo(point[0]+40, point[1]-20);
		ctx.lineTo(point[0], point[1]);
		ctx.fill();
	}

	spin(clear = false){
		if(clear){
			this.results = "";
			resultsArea.innerHTML = "";
			outcomeArea[0].innerHTML = "";
			outcomeArea.hide();
		}
		drawInterval = setInterval(draw, 1000/FPS);
		this.hasEnded = false;
		this.speed = 5 + (Math.random()-0.5) * 2;
		this.started = Date.now();
		this.startBraking = this.started + this.brakingTime + (0.5+Math.random())*this.brakingTime;
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
		clearInterval(drawInterval);
		this.hasEnded = true;
		var result = Math.floor(this.rotation/this.sep);
		this.results += this.items[result]["val"];
		this.individualResults.push(result);
		resultsArea.innerHTML += `<h3>${this.items[result]["text"]}</h3>`;
		if(this.endStates.includes(result)){
			console.log(this.results);
			var total = parseOutcomeString(this.results);
			console.log(total);
			outcomeArea.show();
			outcomeArea[0].innerHTML = `<h3 class="outcome">${total}</h3>`;
		}
		else{
			this.spin();
		}
	}
}