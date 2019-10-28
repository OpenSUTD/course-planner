function NaivePlanner() {
	// find pillar info
	var pillar = $("#pillar option:selected").val()

	// removing exisitng subject combi
	d3.selectAll("svg").remove();
	d3.selectAll(".schedule").remove();

	possibleYValue = {
		Term_4:[0,50,100,200],
		Term_5:[0,50,100,200],
		Term_6:[0,50,100,200],
		Term_7:[50,100,200],
		Term_8:[50,100]}

	courseTaken = {
		Term_4:[],
		Term_5:[],
		Term_6:[],
		Term_7:[],
		Term_8:[]}


	//sorting
	data = data.sort((a, b) => (a[pillar+"_Core"] < b[pillar+"_Core"]) ? 1 : (a[pillar+"_Core"] === b[pillar+"_Core"]) ? ((a.Code > b.Code) ? 1 : -1) : -1 )

	let count = 0
	data.forEach(function (element) {
	  element.Index = count++;
	});
	console.log(data)


	// SVG for list of all mod
	var svg = d3.select("#subjects").append("svg")
	      .attr("width", $("#subjects").width())
	      .attr("height", 3000)

	// SVGs for each term on the left
	for (var i = 4; i < 8; i++) {
			
		d3.select("#calendar").append("div")
		.attr("id","Term_"+i)
		.attr("class","schedule")
		.style("text-align","center")
		.html("<p><strong>Term "+ i+" </strong><input type=\"checkbox\" value=" + i +" onclick=\"overload(this)\"> Overload</p>")

		courseTaken["Term_"+i] = courseTaken["Term_"+i].concat(["02.000"]) // HASS
	}

	// Term 8 no overload
	d3.select("#calendar").append("div")
		.attr("id","Term_"+i)
		.attr("class","schedule")
		.style("text-align","center")
		.html("<p><strong>Term "+ i+" </strong>")

	courseTaken["Term_8"] = courseTaken["Term_8"].concat(["02.000"]) // HASS



	// Append HASS for each term >.<
	var svg2 = d3.selectAll(".schedule").append("svg")
		.attr("width", $("#calendar").width())
	    .attr("height", 300)

	svg2.append("rect")
		.attr("class","mod")
		.attr("x",40)
		.attr("y", 180)
    	.attr("width", $("#calendar").width()*0.9)
    	.attr("height", 30)
		.style("fill","lightgreen")
		.attr("stroke", "black")

	svg2.append("text")
		.attr("transform","translate(" + 50 + "," +200 + ")")
		.text("HASS")
		.style("font", "15px sans-serif")
		.style("text-anchor","left")
	
	// Capstone
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

		courseTaken["Term_"+i] = courseTaken["Term_"+i].concat(["01.40"+(i-7)])

	}

	// Indictator div
	var div = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);


	// Append g and each mod's rect and text
  	var g = svg.selectAll(".mod")
        .data(data)
        .enter().append("g")
        .attr("class", "mod")
        .attr("id",function(d){return d.Code})

	g.append("rect")
		.attr("class","mod")
		.attr("x",40)
		.attr("y", function(d){return 30 + d.Index * 50})
    	.attr("width", $("#subjects").width()*0.9)
    	.attr("height", 30)
		.style("fill",function(d){
			// console.log(d[pillar+"_Core"])
			if(d[pillar+"_Core"] == 1){return "rgba(255,255,0,0.5)"} //if core => yellow
			else{return "rgba(0,0,255,0.5)"} //else => blue
		})
		.attr("stroke", "black")
        .on("mouseover", function(d) {
        	// on mouseover show indictor box when course detail and prof		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(d.Description + "<br><br>  Instructed by: " + d.Professor)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });

    // Course Name and Code, on click choose to enroll into 4/6 or 5/7 or 8
	g.append("text")
		.attr("transform", function(d) { return "translate(" + 50 + "," +(50 + d.Index*50) + ")"; })
		.text(function(d){return d.Code +" " + d.Subject})
		.style("font", "15px sans-serif")
		.style("text-anchor","left")
		.on("click",function(d){

			const allowed = ["Term_4", "Term_5", "Term_6", "Term_7", "Term_8"];

			let temp = JSON.parse(JSON.stringify(d)) //deep copy

			// find key == allowed
			Object.keys(temp)
			  .filter(key => !allowed.includes(key))
			  .forEach(key => delete temp[key]);

			// find allowed term, i.e Term_4 == 1
			options = Object.keys(temp).filter(function(key) {return temp[key] === 1})

			// Dialog box to indicate choice

			ConfirmDialog('Enrolling '+d.Code +' ' + d.Subject + ' in',
				"Choose the term",
				options[0],
				options[1] || "NA",d,pillar);;

			
			
		})


// Object.values(courseTaken).join().split(",")


}

function ConfirmDialog(message,head,option1,option2,data,pillar) {
	// console.log(option1,option2)
	// console.log(data)

	// options object
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

var limit=[4,4,4,4,4];

function overload(elem){
	console.log(elem.value)
	if(elem.checked == true){
	limit[parseInt(elem.value)-4] = 5}
	else{
		limit[parseInt(elem.value)-4] = 4
		
	}
}

function EnrollMod(result,data,pillar){
	// console.log(result)			
	let t_svg = d3.select("#"+result+".schedule").select("svg")
	.append("g").attr("id","enrolled"+data.Code)

	// check pre requiste

	let past_subject = []

	for (var i = 4; i < parseInt(result[result.length-1]); i++) { //last digit
		past_subject = past_subject.concat(courseTaken["Term_"+i])
	}

	console.log("past subject: " + past_subject)
	console.log("Pre_requisite: "+ data.Pre_requisite)
	// let metRequiste = data.Pre_requisite.every(r=> past_subject.includes(r))
	
	let failRequiste = []

	for (var i = 0; i < data.Pre_requisite.length; i++) {
		if(!past_subject.includes(data.Pre_requisite[i])){failRequiste = failRequiste.concat(data.Pre_requisite[i])}
	}
	let totalCourseTaken = Object.values(courseTaken).join().split(",")

	let taken = totalCourseTaken.includes(data.Code)
	
	// if metRequiste, course per term < 4 (-HASS) , not taken before 
	console.log("Met requiste: " + (failRequiste.length == 0))
	console.log("Current course number during this term : " + courseTaken[result].length)
	console.log("taken? "+ taken)

	if(failRequiste.length > 0){

		alert("Fail to met Pre-requisite of :" + failRequiste)
	}
	else if(taken){ alert("Help....You have already taken the subject")}
	else if(courseTaken[result].length >= limit[parseInt(result[result.length-1])-4]){
		alert("Mods are not the more the merrier.") //Get a life please
	}
	else{ // if(metRequiste && courseTaken[result].length < limit[parseInt(result[result.length-1])-4] && !taken)

		console.log("enrolling: " + data.Code)

		// add mod to course taken
		courseTaken[result] = courseTaken[result].concat([data.Code])

		let div = d3.select(".tooltip")

		t_svg.append("rect")
			.attr("class","mod")
			.attr("x",40)
			.attr("y", function(d){	return 30 +  possibleYValue[result][0]})
	    	.attr("width", $("#calendar").width()*0.9)
	    	.attr("height", 30)
			.style("fill",function(d){
				// console.log(d[pillar+"_Core"])
				if(data[pillar+"_Core"] == 1){return "rgba(255,255,0,0.5)"} //if core => yellow
				else{return "rgba(0,0,255,0.5)"} //else => blue
			})
			.attr("stroke", "black")
	        .on("mouseover", function(d) {
	        	// on mouseover show indictor box when course detail and prof		
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
	        });

	    t_svg.append("text")
	    .attr("id",function(d) {return possibleYValue[result][0] })
		.attr("transform", function(d) { 
			let out = "translate(" + 50 + "," +(possibleYValue[result][0] + 50) + ")"
			possibleYValue[result].shift()  // remove first y value
			return out})
		.text(function(d){return data.Code +" " + data.Subject})
		.style("font", "15px sans-serif")
		.style("text-anchor","left")
		.on("click",function(d){

			let r = confirm("Dropping "+data.Code +" " + data.Subject);

			if (r == true) {

				// add back the possible y value
				possibleYValue[result] = possibleYValue[result].concat([parseInt(this.id)])
				possibleYValue[result] = possibleYValue[result].sort(function(a, b){return a-b})

				console.log(possibleYValue[result])
				// remove box
				t_svg.remove();

				// remove mod from course taken
				for( var i = 0; i < courseTaken[result].length; i++){ 
					if ( courseTaken[result][i] === data.Code) {
					 courseTaken[result].splice(i, 1); 
					}
				}

				d3.select("#subjects").select("svg").select('[id="'+data.Code+'"]').style("display","block")

			}
		})

		d3.select("#subjects").select("svg").select('[id="'+data.Code+'"]').style("display","none")
	}
}

var result = "hi"

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


var data = []
d3.csv("data.csv",
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
		Pre_requisite :((d["Pre-requisite"] == "") ? [] : d["Pre-requisite"].split(";"))
	}; })
.then(function(d){
	// sorting, dont work yet
	// ----------------------------------//	
	// console.log(d)
	// let pillar = $("#pillar option:selected").val()
	// console.log(pillar)
	// d = d.sort((a, b) => (a[pillar+"_Core"] < b[pillar+"_Core"]) ? 1 : (a[pillar+"_Core"] === b[pillar+"_Core"]) ? ((a.Code > b.Code) ? 1 : -1) : -1 )
	// 	function(x, y){
	//    return d3.descending(x[pillar+"_Core"], y[pillar+"_Core"]);
	// }

	

	// -----------------------------------//

	data = d; console.log(data)})
.catch(function(error, rows) { console.log(rows); });



