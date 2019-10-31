/*
Written by Zhou Zhi on 28 Oct 2019

NaivePlanner() - onclick function for the button
ConfirmDialog() -- function to create a pop up confirmation of the enrollment of a course
overload() -- function to retrieve info when toggled overload
EnrollMod() -- function to update mod taken, add mod to calendar, remove mod from subjects pool
findTrack()
findMinor()
*/



function NaivePlanner() {
	/*
	This is a general function to create the svgs as well as append the static elements
	*/

	//============================================
	// find pillar info
	//============================================
	var pillar = $("#pillar option:selected").val()

	//============================================
	// Onclick, we want to start fresh, so we
	// remove exisitng subject combi and reset possibleYValue and courseTaken
	//============================================
	d3.selectAll("svg").remove();
	d3.selectAll(".schedule").remove();

	possibleYValue = { //possible Y slots for each svg on the left, y=150 is occupied by HASS by default
		Term_4:[0,50,100,200],
		Term_5:[0,50,100,200],
		Term_6:[0,50,100,200],
		Term_7:[50,100,200], // Capstone 
		Term_8:[50,100]} // Capstone and no overload

	courseTaken = { 
		Term_4:[],
		Term_5:[],
		Term_6:[],
		Term_7:[],
		Term_8:[]}

	// clear track and minor
	$("#track").text("")
	$("#minor").text("")


	//============ Needs Attention ================================ (Would like to say if ESD is choose put all the 40.XXX on top <- yet to be done)
	//Sorting the data, so that all the core mod appear in the top.
	//============================================
	data = data.sort((a, b) => (a[pillar+"_Core"] < b[pillar+"_Core"]) ? 1 : (a[pillar+"_Core"] === b[pillar+"_Core"]) ? ((a.Code > b.Code) ? 1 : -1) : -1 )



	//============================================
	// Adding an Index attribute for each data
	//============================================
	let count = 0
	data.forEach(function (element) {
	  element.Index = count++;
	});
	// console.log(data)


	//============================================
	// Create the mouseOver Indictator div
	//============================================
	var div = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

	//============================================
	// Create the SVGs
	//============================================
	var svg = d3.select("#subjects").append("svg")
	      .attr("width", $("#subjects").width())
	      .attr("height", 60*data.length) // each mod(rect) get a space of 60px in height


	//============================================
	// Append g and each mod's rect and text
	//============================================
  	var g = svg.selectAll(".mod")
        .data(data)
        .enter().append("g")
        .attr("class", "mod")
        .attr("id",function(d){return d.Code})

	g.append("rect")  // just the box
		.attr("class","mod")
		.attr("x",40)
		.attr("y", function(d){return 30 + d.Index * 50})
    	.attr("width", $("#subjects").width()*0.9)
    	.attr("height", 30)
		.style("fill",function(d){
			if(d[pillar+"_Core"] == 1){return "rgba(255,255,0,0.5)"} //if core => yellow
			else {return getColor(parseInt(d.Code))}
		})
		.attr("stroke", "black")
        .on("mouseover", function(d) {
        	// on mouseover show indictor box with course detail and prof, by increasing the opacity
        	let options = filterAvailableTerm(d)

            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(d.Description + "<br><br>  Instructed by: " + d.Professor + "<br><br> Instructed in :" + options)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });

	g.append("text")  // just the text
		.attr("transform", function(d) { return "translate(" + 50 + "," +(50 + d.Index*50) + ")"; })
		.text(function(d){return d.Code +" " + d.Subject})
		.style("font", "15px sans-serif")
		.style("text-anchor","left")
		.on("click",function(d){

			let options = filterAvailableTerm(d)

			// Dialog box to indicate choice
			ConfirmDialog('Enrolling '+d.Code +' ' + d.Subject + ' in',
				"Choose the term",
				options[0],
				options[1] || "NA",d,pillar);; 
			// maximum lengthof options is 2, actually it can only be 4/6,5/7 or 8/NA
		})
	//============================================
	// Create 1 SVG for each term on the left panel
	//============================================
	// Term 4 no overload
	d3.select("#calendar").append("div")
		.attr("id","Term_4")
		.attr("class","schedule")
		.style("text-align","center")
		.html("<p><strong>Term 4"+" </strong>") // no checkbox

	// for term 5 - 7:
	for (var i = 5; i < 8; i++) {
		d3.select("#calendar").append("div")
		.attr("id","Term_"+i)
		.attr("class","schedule")
		.style("text-align","center")
		.html("<p><strong>Term "+ i+" </strong>\
		<input type=\"checkbox\" value=" + i +" onclick=\"overload(this)\"> Overload</p>") // put in a checkbox for overload

	}

	// Term 8 no overload, therefore
	d3.select("#calendar").append("div")
		.attr("id","Term_8")
		.attr("class","schedule")
		.style("text-align","center")
		.html("<p><strong>Term 8"+" </strong>") // no checkbox


	//============================================
	// Append SVG for left calendar
	//============================================

	var svg2 = d3.selectAll(".schedule").append("svg")
		.attr("width", $("#calendar").width())
	    .attr("height", 300)
	//============================================
	// Append HASS to the svg of each term >.<
	//============================================

	// svg2.append("rect")
	// 	.attr("class","mod")
	// 	.attr("x",40)
	// 	.attr("y", 180)
 //    	.attr("width", $("#calendar").width()*0.9)
 //    	.attr("height", 30)
	// 	.style("fill","lightgreen")
	// 	.attr("stroke", "black")

	// svg2.append("text")
	// 	.attr("transform","translate(" + 50 + "," +200 + ")")
	// 	.text("HASS")
	// 	.style("font", "15px sans-serif")
	// 	.style("text-anchor","left")

	//============================================
	// Append Capstone for Term 7 & 8
	//============================================
	for (var i = 7; i < 9; i++) {
		let svg_Cap = d3.select("#Term_"+i+".schedule").select("svg")

		svg_Cap.append("rect")
		.attr("class","mod")
		.attr("x",40)
		.attr("y", 30)
    	.attr("width", $("#calendar").width()*0.9)
    	.attr("height", 30)
		.style("fill","rgba(255,255,0,0.5)")
		.attr("stroke", "black")

		svg_Cap.append("text")
		.attr("transform","translate(" + 50 + "," +50 + ")")
		.text("Capstone")
		.style("font", "15px sans-serif")
		.style("text-anchor","left")

		// include capstone as taken subjects
		courseTaken["Term_"+i] = courseTaken["Term_"+i].concat(["01.40"+(i-7)])

	}
}

function getColor(i){
	var color
	switch (i){
		case 1: //TAE
			color = "rgba(0,0,255,0.5)" //blue
			break;
		case 2: //HASS 
			color = "rgba(0,255,0,0.5)" //yellow
			break;
		case 30: // EPD
			color = "rgba(255,0,175,0.5)" //pink
			break;
		case 40: // ESD
			color = "rgba(125,255,0,0.5)" // green
			break;
		case 50: // ISTD
			color = "rgba(0,255,175,0.5)" // cyan
			break;
	}	
	return color
}

function filterAvailableTerm(d){
	const allowed = ["Term_4", "Term_5", "Term_6", "Term_7", "Term_8"];

	let temp = JSON.parse(JSON.stringify(d)) //deep copy the data entry

	// find key == allowed
	Object.keys(temp)
	  .filter(key => !allowed.includes(key))
	  .forEach(key => delete temp[key]);

	// find allowed term, i.e Term_4 == 1
	options = Object.keys(temp).filter(function(key) {return temp[key] === 1})

	return options
}
function ConfirmDialog(message,head,option1,option2,data,pillar) {
	/*
	This function creates a customised dialog box with option1 and option2
	*/
	//============================================
	// Click Option1 => Try to enroll mod into option1's term, same for Option2, click close to close -.-
	//============================================	
	options = {}
	options[option1] = function() {
		EnrollMod(option1,data,pillar)
		$(this).dialog("close");
		
        }
    options[option2] = function() {
    	EnrollMod(option2,data,pillar)
    	$(this).dialog("close");
    	
        }
    options["close"] = function(event, ui) {
        $(this).remove();
      }

	//============================================
	// Some html config for the box
	//============================================
	$('<div></div>').appendTo('body')
	.html('<div><h6>' + message + '?</h6></div>')
	.dialog({
		modal: true,
		title: head,
		zIndex: 10000,
		autoOpen: true,
		width: 'auto',
		resizable: false	,
		buttons: options,
	});
};

function colorCode(){

	let html_string = '<div>'

	html_string += '<div style="width:20px;height:20px;display: inline-block;background-color:rgba(255,255,0,0.5);"></div><strong> Core</strong><br>'
	html_string += '<div style="width:20px;height:20px;display: inline-block;background-color:'+ getColor(1) +';"></div><strong> TAE</strong><br>'
	html_string += '<div style="width:20px;height:20px;display: inline-block;background-color:'+ getColor(2) +';"></div><strong> HASS</strong><br>'
	html_string += '<div style="width:20px;height:20px;display: inline-block;background-color:'+ getColor(30) +';"></div><strong> EPD</strong><br>'
	html_string += '<div style="width:20px;height:20px;display: inline-block;background-color:'+ getColor(40) +';"></div><strong> ESD</strong><br>'
	html_string += '<div style="width:20px;height:20px;display: inline-block;background-color:'+ getColor(50) +';"></div><strong> ISTD</strong><br>'


	// console.log(html_string)
	//============================================
	// Some html config for the box
	//============================================
	$('<div></div>').appendTo('body')
	.html(html_string +'</div>')
	.dialog({
		modal: true,
		title: "Colors",
		zIndex: 10000,
		autoOpen: true,
		width: 200,
		resizable: false	,
		buttons: {close: function(event,ui){$(this).remove()}},
	});	
}

function overload(elem){
	/*
	This function track the overloading situation
	*/
	//============================================
	// if checked overload, change limit to 5
	//============================================
	if(elem.checked == true){
		limit[parseInt(elem.value)-4] = 5} // limit is defined as an array of [4,4,4,4,4] down
	else{
		limit[parseInt(elem.value)-4] = 4
		
	}
}

function EnrollMod(term,data,pillar){
	/*
	This function evaluate if the mod from "data" could be enrolled into the term "term"
	*/

	//============================================
	// Select the correct SVG on the left
	//============================================		
	let t_svg = d3.select("#"+term+".schedule").select("svg")
				.append("g").attr("id","enrolled"+data.Code)

	//============================================
	// Check pre-requisite
	//============================================

	let past_subject = []

	for (var i = 4; i < parseInt(term[term.length-1]); i++) { //last digit
		past_subject = past_subject.concat(courseTaken["Term_"+i]) // for every upto the argument term, concat subjects taken
	}

	// console.log("past subject: " + past_subject)
	// console.log("Pre_requisite: "+ data.Pre_requisite)
	
	let failedRequisite = []  // Keep track of missing requisite

	for (var i = 0; i < data.Pre_requisite.length; i++) {
		if(!past_subject.includes(data.Pre_requisite[i])){ // if pre-requisite not taken, put the pre-requisite into failedRequisite
			failedRequisite = failedRequisite.concat(data.Pre_requisite[i])
		}
	}

	for (var i = 0; i < data.Pre_requisite_select1.length; i++){
		if(!data.Pre_requisite_select1[i].some(r => past_subject.includes(r))){
			failedRequisite = failedRequisite.concat("One from :" + data.Pre_requisite_select1[i])
		}
	}

	//============================================
	// Find all the past courses taken and check if user has already taken the course, i.e take 30.007 in term 5 and term 7

	let allTakenCourses = Object.values(courseTaken).join().split(",")

	let taken = allTakenCourses.includes(data.Code)

	//============================================	
	// Console log the criteria
	//============================================
	// console.log("Met requiste: " + (failedRequisite.length == 0))
	// console.log("Current course number during this term : " + courseTaken[term].length)
	// console.log("taken? "+ taken)

	//============================================
	// Evaluation
	//============================================
	if(failedRequisite.length > 0){
		alert("Fail to met Pre-requisite of :" + failedRequisite) // if not met pre-requisite, alert
	}
	else if(taken){ 
		alert("Help....You have already taken the subject") // if already taken the subject before, alert
	}
	else if(courseTaken[term].length >= limit[parseInt(term[term.length-1])-4]){
		alert("Mods are not the more the merrier.") //if exceed term limit of 4 or 5(overload), alert
	}
	else{ // if(metRequiste && courseTaken[term].length < limit[parseInt(term[term.length-1])-4] && !taken)

		if(data.HASS && hassTaken[parseInt(term[term.length-1])-4] > 0){
			alert("One HASS per term, for now")
			return
		}
		// console.log("enrolling: " + data.Code)

		// add mod to course taken
		courseTaken[term] = courseTaken[term].concat([data.Code])
		if(data.HASS){
			hassTaken[parseInt(term[term.length-1])-4] += 1
		}

		// call findTrack() and findMinor to see if any track and minor is satisfied 
		findTrack(pillar)
		findMinor(pillar)

		// hide the selected mod on the subject list
		d3.select("#subjects").select("svg").select('[id="'+data.Code+'"]').style("display","none")

		//============================================
		// Adjust the left panel SVG
		//============================================
		let div = d3.select(".tooltip")

		t_svg.append("rect")
			.attr("class","mod")
			.attr("x",40)
			.attr("y", function(d){	
				if(data.HASS){return 180}
				else{return 30 +  possibleYValue[term][0]}})
	    	.attr("width", $("#calendar").width()*0.9)
	    	.attr("height", 30)
			.style("fill",function(d){
				if(data[pillar+"_Core"] == 1){return "rgba(255,255,0,0.5)"} //if core => yellow
				else {return getColor(parseInt(data.Code))}
			})
			.attr("stroke", "black")
	        .on("mouseover", function(d) {
	        	// on mouseover show indictor box with course detail and prof		
	            div.transition()		
	                .duration(200)		
	                .style("opacity", .9);		
	            div	.html(data.Description + "<br><br>  Instructed by: " + data.Professor)	
	                .style("left", (d3.event.pageX) + "px")		
	                .style("top", (d3.event.pageY - 28) + "px");	
	            })					
	        .on("mouseout", function(d) {		
	            div.transition()		
	                .duration(500)		
	                .style("opacity", 0);	
	        })
	        

		t_svg.append("text")
		.attr("id",function(d) {return possibleYValue[term][0] }) // id as y-value
		.attr("transform", function(d) { 
			let out;
			if(data.HASS){out =  "translate(" + 50 + "," + 200 + ")"}
			else{out = "translate(" + 50 + "," +(possibleYValue[term][0] + 50) + ")" 
				possibleYValue[term].shift() 			  // remove first y value <- the last line is the last usage of this y-value
			}	
			return out})
		.text(function(d){return data.Code +" " + data.Subject})
		.style("font", "15px sans-serif")
		.style("text-anchor","left")
		.on("click",function(d){ // if clicked, => intention to withdraw the course
			//============================================
			// Course Withdrawal
			//============================================
			let r = confirm("Dropping "+data.Code +" " + data.Subject); // alert

			if (r == true) { // user confirmation

				// add back the possible y value
				possibleYValue[term] = possibleYValue[term].concat([parseInt(this.id)])
				possibleYValue[term] = possibleYValue[term].sort(function(a, b){return a-b})

				// remove rect and text
				t_svg.remove();

				// remove mod from course taken
				for( var i = 0; i < courseTaken[term].length; i++){ 
					if ( courseTaken[term][i] === data.Code) {
					 courseTaken[term].splice(i, 1); 
					}
				}

				// display the subject on the right again
				d3.select("#subjects").select("svg").select('[id="'+data.Code+'"]').style("display","block")

				// check track and minor condition once again
				findTrack(pillar)
				findMinor(pillar)

			}
		})		
	}
}

function findTrack(pillar){
	/*
	This function finds the Focus Track, if any
	*/

	let allTakenCourses = Object.values(courseTaken).join().split(",")

	// limit search dataset to those available for the selected pillar only
	let pillarOnly = tdata.filter(function(entry){return entry.major===pillar})

	// initial track = nothing
	let tracks = ""

	//=================Looking for better algo ===========================
	// exhausive search 
	//============================================
	pillarOnly.forEach(function(d){ // for each track

		// if taken all the required course
		if(d.required_course.every(r=> allTakenCourses.includes(r))){ 
			// if taken the required choose 1 mod, i.e ML or SML, if there's any of such choices
			if(d.select1.length == 0 || d.select1.every(mod=> mod.some(r=> allTakenCourses.includes(r)))){
				// if taken at least n required electives, i.e 4 elective in ISTD case
				if(d.selectN.filter(r => allTakenCourses.includes(r)).length >= d.n){
					tracks +=  d.Track + ";  " // add the track
				}
			}
		}
	})

	// edit DOM
	$("#track").text(tracks)
}

function findMinor(pillar){

	/*
	This function finds the Minor Program, if any
	*/

	let allTakenCourses = Object.values(courseTaken).join().split(",")

	// limit search dataset to those available for the selected pillar only
	let pillarOnly = mdata.filter(function(entry){return entry.major===pillar})

	// initial track = nothing
	let minor = ""

	//=================Looking for better algo ===========================
	// exhausive search 
	//============================================
	pillarOnly.forEach(function(d){ // for each track
		console.log(d)
		// if taken all the required course
		if(d.required_course.every(r=> allTakenCourses.includes(r))){ 
			// if taken the required choose 1 mod, i.e ML or SML, if there's any of such choices
			if(d.select1.length == 0 || d.select1.every(mod=> mod.some(r=> allTakenCourses.includes(r)))){
				// if taken at least n required electives, i.e 4 elective in ISTD case
				if(d.selectN.length == 0 || d["selectN"][0].filter(r => allTakenCourses.includes(r)).length >= d["n"][0]){
					console.log("first met")
					if(d.selectN.length == 1 || d["selectN"][1].filter(r => allTakenCourses.includes(r)).length >= d["n"][1]){
					minor +=  d.Minor + ";  " // add the track
					}
				}
			}
		}
	})
	$("#minor").text(minor)
}


//============================================
//Initialise variables
//============================================
var limit=[4,4,4,4,4];

var possibleYValue = {
	Term_4:[0,50,100,200],
	Term_5:[0,50,100,200],
	Term_6:[0,50,100,200],
	Term_7:[50,100,200],
	Term_8:[50,100]}

var courseTaken = {
	Term_4:[],
	Term_5:[],
	Term_6:[],
	Term_7:[],
	Term_8:[]}

var hassTaken = [0,0,0,0,0]
//============================================
// Data Fetching
//============================================

// course data
var data = []
d3.csv("data - _courses.csv",
	function(d) { return {
		Subject : d.Subject,
		Code : d.Code,
		Description: d.Description,
		Professor : d.Professor,
		ASD_Core : +d["Core ASD"],
		ESD_Core : +d["Core ESD"],
		EPD_Core : +d["Core EPD"],
		ISTD_Core : +d["Core ISTD"],
		Term_4 : +d["Term 4"],
		Term_5 : +d["Term 5"],
		Term_6 : +d["Term 6"],
		Term_7 : +d["Term 7"],
		Term_8 : +d["Term 8"],
		HASS: (parseInt(d.Code) == 2), 
		Pre_requisite :((d["Pre-requisite"] == "") ? [] : d["Pre-requisite"].split(";")),
		Pre_requisite_select1 : ((d["Alt-requisite"] == "") ? [] : d["Alt-requisite"].split("#").map(function(e) {return e.split(";");})) 
	}; })
.then(function(d){
	data = d; 
	console.log(data)
})
.catch(function(error, rows) { console.log(rows); });

// track data
var tdata = []
d3.csv("data - _tracks.csv",
	function(d){
		
		return{
			Track:d.Track,
			required_course:((d["Required"] == "") ? [] : d["Required"].split(";")), // must take
			select1:((d["ReqOption"] == "") ? [] : d["ReqOption"].split("#").map(function(e) {return e.split(";");})), // select 1 from
			selectN:((d["Option"] == "") ? [] : d["Option"].split(";")),
			n: +d.OptionNumber,
			major: d.Pillar	
	}; }).then(function(d){
	tdata = d; 
	console.log(tdata)
	})
	.catch(function(error, rows) { console.log(rows); });

// minor data
var mdata = []
d3.csv("data - _minor.csv",
	function(d){
	return{
			Minor:d.Minor,
			required_course:((d["Required"] == "") ? [] : d["Required"].split(";")), // must take
			select1:((d["ReqOption"] == "") ? [] : d["ReqOption"].split("#").map(function(e) {return e.split(";");})), // select 1 from
			selectN:((d["Option"] == "") ? [] : d["Option"].split("#").map(function(e) {return e.split(";");})),
			n: d.OptionNumber.split(";").map(Number),
			major: d.Pillar	
	}; }).then(function(d){
	mdata = d; 
	console.log(mdata)
	})
	.catch(function(error, rows) { console.log(rows); });


