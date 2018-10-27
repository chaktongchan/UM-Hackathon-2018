var pageParams = {};

function setTitle(title){
	title = decodeURIComponent(title);

	document.title = title + ' | Dine in UM';
	$("#title").text(title);
}

function getUrlParam(param) {
	if(pageParams.init){
	}
	else{
		pageParams.init = true;

		console.log("Fetch Param");
		var params = window.location.search.substring(1).split("&");

		for(var i=0; i<params.length; i++) {
			var thisParam = params[i].split("=");

			pageParams[thisParam[0]] = thisParam[1];
		}
	}
	if(pageParams[param]){
		return pageParams[param];
	}
	return undefined;
}

function finishLoading(el){
	$(el).find(".loading").remove();
}

function getJSON(url, callback){
	return getJSON(url, {}, callback);
}

function getJSON(url, obj, callback) {
	return $.getJSON('http://10.8.207.15:3000/' + url, obj, function(data){
		callback(data);
	});
}
function get_DD_MM(d){
	return (d.getDate()) + '/' + (d.getMonth()+1);
}
function returnDay_YMD(d, with_slash) {
	var spl = '-';

	if(with_slash) {
		spl = '/';
	}
	return (d.getFullYear()) + spl + (d.getMonth()+1) + spl + (d.getDate());
}

function getToday_YMD(with_slash){
	var d = new Date();
	return returnDay_YMD(d, with_slash);
}
function getNearestDay_YMD(with_slash){
	var d = new Date();

	if(d.getHours() >= 20) {
		d.setDate(d.getDate() + 1);
	}
	return returnDay_YMD(d, with_slash);
}
