$('document').ready(function() {
	//store elements as variables
	var $output = $('#output');
	var $numres = $('#numres');
	var $searchfor = $('#searchfor');

	var noresults = true; //boolean value to trigger no results display
	var count = 0; //initialize a count of # of results

	var $begindate = $('#begdate'); //store input beginning date
	var $enddate = $('#enddate'); //store input endding date

	function checkSort() {
		//decalre a function to check selected sort
		var $sortvalue = $('#sortby'); //store slected value
		var sortvalue = '&sort_by=' + $sortvalue.val(); //put the selected value into a string to be injected into the URL
		return sortvalue; //return the string value
	}

	//if user hits enter key on search call search function
	$('#searchfor').keypress(function(e) {
		if (e.which == 13) {
			$('#search').click(); //call the search function
		}
	});

	//if user hits enter key on begin date call filter function
	$('#begdate').keypress(function(e) {
		if (e.which == 13) {
			$('#search').click(); //call search function
		}
	});

	//if user hits enter key on end date call filter function
	$('#enddate').keypress(function(e) {
		if (e.which == 13) {
			$('#search').click(); //call search functiuon
		}
	});

	//if user clicks search button (see previous comments)
	$('#search').click(function() {
		var sortvalue = checkSort(); //see what sort value is selected and store it in a local var
		var searchTerm = $searchfor.val(); //store the value of the user's search
		var searchArr = []; //decalare an empty array
		//trim excess white space from user's input, convert to upper case to alleviate any case sensitive search issues, split on the spaces
		searchTerm = searchTerm
			.trim()
			.toUpperCase()
			.split(' ');
		for (i = 0; i <= searchTerm.length - 1; i++) {
			//for every word in the user's input
			searchArr += searchTerm[i]; //add each word to the search array
		}

		var begindate = $begindate.val(); //assign the begin date value to a var
		var enddate = $enddate.val(); //assign the end date value to a var

		//if begin date is not selected/input
		if (begindate == '') {
			begindate = new Date('01/01/1900'); //create a dummy date
			var startdate = begindate; //assign the dummy date
		} else {
			//if begind date is selected/input

			var begindateARR = begindate.split('/'); //split the date on the / and assign each number to an array
			var startdate = new Date(begindateARR); //create a date and assign it to the startdate var
		}

		//if end date is empty
		if (enddate == '') {
			enddate = new Date(); //create a new date var of today's date
			var finaldate = enddate; //assign the new date to var finaldate
		} else {
			//if an end date is input
			var enddateARR = enddate.split('/'); //split the date on the /
			var finaldate = new Date(enddateARR); //create a new date object and assign it to the finaldate var
		}

		noresults = true; //set noresults trigger
		$output.empty(); //clear the output
		$numres.empty(); //clear the number of results
		count = 0; //reset the number of results

		$.ajax({
			type: 'GET',
			url:
				'https://lgapi-us.libapps.com/1.1/guides/?site_id=8488&key=0b8da796b00334ae3471f60e6a10e8c6' +
				sortvalue +
				'&sort_dir=asc&expand=owner,',
			success: function(guides) {
				$.each(guides, function(i, guide) {
					//for every guide in the request

					var name = guide.name.toUpperCase(); //get the name of the guide and set it to be uppercase
					var nameArr = name.split(' '); //split the name on space(s) and assign the value to an array
					var title = ''; //create an empty var
					for (i = 0; i < nameArr.length; i++) {
						//for every word in the name
						title += nameArr[i]; //assign each word in the title to the empty var
					}

					var group = guide.type_label.toUpperCase(); //get the type label of each guide and change to uppercase
					var groupArr = group.split(' '); //split the group type label on the space(s)
					var group_label = ''; //create an empty var
					for (i = 0; i < groupArr.length; i++) {
						//for every word in the group type
						group_label += groupArr[i]; //assign the word(s) to the empty var
					}

					var fname = guide.owner.first_name.toUpperCase(); //get the author's first name and change it to uppercase
					var lname = guide.owner.last_name.toUpperCase(); //get the author's last name and change it to uppercase
					var fullname = fname + lname; //add the first and last name together and store in a fullname var
					var id = guide.id; //get the guide's id #
					var desc = guide.description.toUpperCase(); //get the guide's description and change it to uppercase

					var published = guide.published.substring(0, 10); //get the first 10 chars in the guide's published date
					var dateArr = published.split('-'); //split the published date substring on the - and store in an array
					var date = dateArr[1] + '/' + dateArr[2] + '/' + dateArr[0]; //store the array values in a var in the correct order for mm/dd/yyyy
					var pubdate = new Date(dateArr); //create a new date object with the correctly formatted date

					var status = guide.status; //get the guide's status (0=not published, 1=published, 2=private)

					if (status != 0 && status != 2) {
						//if the guide is neither private or not published (aka is published)
						// check to see if the user's search word(s) are included in various guide attributes
						if (
							fullname.includes(searchArr) ||
							title.includes(searchArr) ||
							group_label.includes(searchArr) ||
							desc.includes(searchArr) ||
							fname.includes(searchTerm) ||
							lname.includes(searchTerm) ||
							id.includes(searchTerm)
						) {
							if (startdate <= pubdate && pubdate <= finaldate) {
								//if the guide was published with in the dates the user is looking at
								//output a card with the guide's information and a link to the guide
								$output.append(
									'<div class="card border-info my-2 shadow">' +
										'<h4 class="card-header">' +
										guide.name +
										' </h4> <ul> ' +
										'<li> Author: ' +
										guide.owner.first_name +
										' ' +
										guide.owner.last_name +
										'</li>' +
										'<li> Description: ' +
										guide.description +
										'</li>' +
										'<li> Type: ' +
										guide.type_label +
										'</li>' +
										'<li> Published on: ' +
										date +
										'</li>' +
										'<li> <a href="' +
										guide.url +
										'" class="text-info">' +
										'Read More' +
										'</a> </li> </div>'
								);

								count = count + 1; //add 1 to the number of results
								noresults = false; //do not trigger the no results output
							}
						}
					}
				});

				if (noresults == false) {
					//if there were results
					$numres.append(
						'<h6 class="mt-2"> Showing ' + count + ' results.</h6>'
					); //output the number of results
				}

				if (noresults == true) {
					//if there were no results
					$output.append('No results.'); //say no results
				}
			},

			error: function() {
				//if there was an error loading
				alert('Something went wrong...');
			},
		});
	});

	//when user clicks the clear search button
	$('#clear').on('click', function() {
		$output.empty(); //clear the output
		$('#searchfor').val(''); //clear the search bar
		$('#begdate').val(''); //clear the beginning date
		$('#enddate').val(''); //clear the ending date
		$numres.empty(); //clear the number of results
		document.getElementById('sortby').selectedIndex = 0; //clear the sort by
	});

	//if user clicks the reset filter button
	$('#reset').on('click', function() {
		$output.empty(); //clear the results
		$('#begdate').val(''); //clear the beginning date
		$('#enddate').val(''); //clear the endding date
		$numres.empty(); //clear the number of results
		$('#search').click(); //rerun the search
	});

	//when user selects a sort
	$('#sortby').change(function() {
		$('#search').click(); //rerun the search
	});
});
