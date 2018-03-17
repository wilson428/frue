var svg_image = d3.select("#frue #frue_svg");
var canvas = document.getElementById("canvas");
var width = 240;
var height = 240;
var margin = { top: 10, right: 40, bottom: 30, left: 40 };
var chart_width = width - (margin.left + margin.right);
var chart_height = height - (margin.top + margin.bottom);
var xScale = d3.scaleLinear().domain([0, 1]).range([0, chart_width]);
var yScale = d3.scaleLinear().domain([0,1]).range([chart_height, 0]);

svg_image.attr("height", chart_height).attr("width", chart_width);

var value, value_left = 0.5, value_right = 1;

var g_frue_image = svg_image.append("g").attr("class", "g_frue");

function generator() {
	var svg = d3.select("#frue #frue_generator");

	var img = document.getElementById("frue_image");
	var a = document.getElementById("frue_download");

	svg.attr("width", width).attr("height", height);

	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	xAxis.tickValues(d3.range(0, 1.1, 0.2));
	xAxis.tickSize(-chart_height, 0);

	yAxis.tickValues([]);
	yAxis.tickSize(0, 0);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + margin.left + "," + (chart_height + margin.top) + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")		
		.call(yAxis);

	var g_frue = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("class", "g_frue");
	var g_dots = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	// top line. The -3 and +3 are because the stroke-width is 6
	d3.selectAll(".g_frue").append("path")
		.attr("id", "top_line")
		.style("stroke-width", "6px")
		.style("stroke", "black")
		.attr("d", "M" + (xScale(0) - 3) + "," + yScale(1) + "L" + (xScale(1) + 3) + "," + yScale(1));

	var upright = g_frue.append("path")
		.style("stroke-width", "6px")
		.style("stroke", "black")
		.attr("d", "M" + xScale(0.5) + "," + (yScale(0) + 1) + "L" + xScale(0.5) + "," + yScale(1));

	var horizontal = g_frue.append("path")
		.style("stroke-width", "6px")
		.style("stroke", "black")
		.attr("d", "M" + xScale(0.5) + "," + yScale(0.5) + "L" + xScale(1) + "," + yScale(0.5));

	var dot_left = g_dots.append("circle")
		.attr("cx", xScale(0.5))
		.attr("cy", yScale(0.5))
		.attr("r", 12)
		.attr("id", "dot_left")
		.attr("class", "dot")
	    .call(d3.drag()
	    .on("start", dragstarted)
	    .on("drag", dragged)
	    .on("end", dragended));

	var dot_right = g_dots.append("circle")
		.attr("cx", xScale(1))
		.attr("cy", yScale(0.5))
		.attr("r", 12)
		.attr("class", "dot highlighted")
		.attr("id", "dot_right")
	    .call(d3.drag()
	    .on("start", dragstarted)
	    .on("drag", dragged)
	    .on("end", dragended));

	var x_start,
		x_max_left = xScale(0.5),
		x_max_right = xScale(1);

	function dragstarted(d) {
		x_start = d3.event.x;

		if (this.id == "dot_left") {
			x_offset = parseInt(dot_left.attr("cx"), 10) - x_start;
			if (value_right != 1) {
				d3.select("#instructions").html("By convention, the upright can only move to the left of 0.5, and only when the horizontal bar ends at 1.");
				value_right = 1;
				setHorizontal();
			}
		} else {
			x_offset = parseInt(dot_right.attr("cx"), 10) - x_start;
			if (value_left != 0.5) {
				d3.select("#instructions").html("By convention, the horizontal line can only move to the left down to 0.5, and only when the upright line is at 0.5.");
				value_left = 0.5;
				setUpright();
			}
		}
		updateValue();
	}

	function dragged(d) {
		if (this.id == "dot_left") {
			var x = parseInt(d3.event.x + x_offset - 3); // -6 because stroke-width is 6px
			x = Math.min(Math.max(0, x), x_max_left);

			value_left = xScale.invert(x);
			setUpright();
			setHorizontal();
			updateValue();
		} else {
			var x = parseInt(d3.event.x + x_offset - 3); // -6 because stroke-width is 6px
			x = Math.min(Math.max(x_max_left, x), x_max_right);

			value_right = xScale.invert(x);
			setUpright();
			setHorizontal();
			updateValue();
		}
	}

	function dragended(d) {

	}

	d3.select("#frue_value").on("keyup", function() {
		var v = parseFloat(this.value);
		var s = String(this.value);
		console.log(v, s);
		if (s == "0." || s == ".") {
			console.log(s);
			this.value == "0.";
			v = 0;
			value = 0;
			value_left = Math.min(v, 0.5);
			value_right = 1 - v;
			setUpright();
			setHorizontal();
			updateValue();
			this.value = "0.";
			return;		
		} else if (s == "") {
			return;
		} else if (typeof v != "number" || !v && v !== 0) {
			this.value = 0;
			return;
		}
		v = Math.min(1, Math.max(0, v));
		v = Math.round(v * 10000) / 10000;
		this.value = v;
		value = v;
		value_left = Math.min(v, 0.5);
		value_right = 1 - v + value_left;
		setUpright();
		setHorizontal();
		updateValue();
	});

	setUpright();
	updateValue();
}

function setHorizontal() {
	dot_right.attr("cx", xScale(value_right));
	dot_left.attr("cx", xScale(value_left));
	horizontal.attr("d", "M" + xScale(value_left) + "," + yScale(0.5) + "L" + (xScale(value_right) + 3) + "," + yScale(0.5));
}

function setUpright() {
	dot_left.attr("cx", xScale(value_left));
	upright.attr("d", "M" + xScale(value_left) + "," + (yScale(0) + 1) + "L" + xScale(value_left) + "," + yScale(1));
}

function updateValue() {
	value = 1 - (value_right - value_left);
	value = Math.round(value * 10000) / 10000;
	d3.select("#frue_value").attr("value", value);

	svg_image.select("g").remove();
	var g_image = svg_image.append("g").html(g_frue.node().innerHTML);
	g_image
	g_image.attr("transform", "translate(8, 8)");
	g_image.selectAll("path").style("stroke-width", "16px");
	g_image.select("#top_line").attr("d", "M" + (xScale(0) - 8) + "," + yScale(1) + "L" + (xScale(1) + 8) + "," + yScale(1));

	canvg(canvas, svg_image.node().outerHTML);
	var src = canvas.toDataURL("image/png");
	img.src = src;

	a.href = src;
	a.download = "frue_" + value + ".png";

	if (value == 0.5) {
		g_dots.selectAll("circle").classed("highlighted", true);
	} else if (value > 0.5) {
		dot_left.classed("highlighted", false);
		dot_right.classed("highlighted", true);
	} else {
		dot_left.classed("highlighted", true);
		dot_right.classed("highlighted", false);
	}
}

