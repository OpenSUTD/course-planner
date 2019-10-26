function NaivePlanner() {
	// find pillar info
	var pillar = $("#pillar option:selected").val()

	// console.log(pillar)

	// removing exisitng subject combi
	d3.selectAll("svg").remove();


	// sorting, dont work yet
	//----------------------------------//	
	// console.log(data)

	// data =data.sort(function(x, y){
	//    return d3.descending(x.EPD_Core, y.EPD_Core);
	// })

	// console.log(data)
	//-----------------------------------//

	var svg = d3.select("#subjects").append("svg")
	      .attr("width", $("#subjects").width())
	      .attr("height", $("#subjects").height())

	for (var i = 4; i < 9; i++) {
			
		d3.select("#calendar").append("div")
		.attr("id","term"+i)
		.attr("class","schedule")
		.style("text-align","center")
		.html("<p><strong>Term "+ i+" </strong><input type=\"checkbox\" id=\"OL"+i+"\" value=\"OL"+i+"\"> Overload</p>")
	}

	d3.selectAll(".schedule").append("svg")
		.attr("width", $("#subjects").width())
	    .attr("height", $("#subjects").height()*0.17)
	    .attr("id","term"+i)



  	var g = svg.selectAll(".mod")
        .data(data)
        .enter().append("g")
        .attr("class", "mod");

	var div = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

	g.append("rect")
		.attr("class","mod")
		.attr("x",50)
		.attr("y", function(d){return 30 + d.Index * 50})
    	.attr("width", $("#subjects").width()*0.8)
    	.attr("height", 30)
		.style("fill",function(d){
			// console.log(d[pillar+"_Core"])
			if(d[pillar+"_Core"] == 1){return "rgba(255,255,0,0.5)"} //yellow
			else{return "rgba(0,0,255,0.5)"} //blue
		})
		.attr("stroke", "black")
        .on("mouseover", function(d) {		
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

	g.append("text")
		.attr("transform", function(d) { return "translate(" + 80 + "," +(50 + d.Index*50) + ")"; })
		.text(function(d){return d.Code +" " + d.Subject})
		.style("font", "20px sans-serif")
		.style("text-anchor","left")
		.on("click",function(d){

			const allowed = ["Term_4", "Term_5", "Term_6", "Term_7", "Term_8"];

			let temp = JSON.parse(JSON.stringify(d)) //deep copy
			Object.keys(temp)
			  .filter(key => !allowed.includes(key))
			  .forEach(key => delete temp[key]);

			options = Object.keys(temp).filter(function(key) {return temp[key] === 1})



			ConfirmDialog('Enrolling '+d.Code +' ' + d.Subject + ' in',"Choose the term",options[0],options[1] || "NA");

			
		})


	// var svg2 = d3.select("#calendar").append("svg")
	//       .attr("width", $("#calendar").width())
	//       .attr("height", $("#calendar").height())




}

function ConfirmDialog(message,head,option1,option2) {
	console.log(option1,option2)

	options = {}
	options[option1] = function() {
		$(this).dialog("close");
		return true
        }
    options[option2] = function() {
    	$(this).dialog("close");
    	return false
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



	//get data
	var data = []
	var count = 0
	d3.csv("data.csv",
		function(d) { return {
			Index : count++,
			Subject : d.Subject,
			Code : parseFloat(d.Code),
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
			Pre_requisite : d["Pre-requisite"].split(";")
		}; })
	.then(function(d){data = d})
	.catch(function(error, rows) { console.log(rows); });



