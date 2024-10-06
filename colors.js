var colors = [

	[ 0, 0, 0 ],
	[ 171, 46, 255 ],
	[ 255, 26, 26 ],
	[ 56, 242, 255 ],
	[ 255, 224, 204 ]

	// [ 255, 255, 0 ],
	// [ 255, 0, 0 ],
	// [ 0, 255, 255 ]

	// [ 0, 0, 0 ],
	// [ 20, 0, 60 ],  // DARK B
	// [ 8, 60, 56 ],  // DARK G
	// [ 18, 255, 0 ],  // G
	// [ 90, 15, 225 ],  // B
	// [ 245,0,0 ],  // RED WARM
	// [ 220,0,255 ]  // RED COLD
	
];

function randomColor(set) {
	let c = set[ Math.floor( random(set.length) ) ];
	return color(...c);
}
// wechat:Liesle1