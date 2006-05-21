var xmlhttp = false;

var cat_view_mode = false;

/*@cc_on @*/
/*@if (@_jscript_version >= 5)
// JScript gives us Conditional compilation, we can cope with old IE versions.
// and security blocked creation of the objects.
try {
	xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
} catch (e) {
	try {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttp_rpc = new ActiveXObject("Microsoft.XMLHTTP");
	} catch (E) {
		xmlhttp = false;
		xmlhttp_rpc = false;
	}
}
@end @*/

if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
	xmlhttp = new XMLHttpRequest();
	xmlhttp_rpc = new XMLHttpRequest();
}

function viewCategory(cat) {
	viewfeed(cat, 0, '', false, true);
}

function viewfeed(feed, skip, subop, doc, is_cat, subop_param) {
	try {

		if (!doc) doc = parent.document;
	
		enableHotkeys();
	
/*		var searchbox = doc.getElementById("searchbox");

		var search_query = "";
		var search_mode = "";

		if (searchbox) {
			search_query = searchbox.value;
		} 
	
		var searchmodebox = doc.getElementById("searchmodebox");
	
		var search_mode;
		
		if (searchmodebox) {
			search_mode = searchmodebox[searchmodebox.selectedIndex].text;
		}
	
		var viewbox = doc.getElementById("viewbox");
	
		var view_mode;
	
		if (viewbox) {
			view_mode = viewbox[viewbox.selectedIndex].text;
		} else {
			view_mode = "All Posts";
		} 
	
		setCookie("ttrss_vf_vmode", view_mode, getCookie("ttrss_cltime")); 
	
		var limitbox = doc.getElementById("limitbox");
	
		var limit;
	
		if (limitbox) {
			limit = limitbox[limitbox.selectedIndex].text;
			setCookie("ttrss_vf_limit", limit, getCookie("ttrss_cltime"));
		} else {
			limit = "All";
		}
	
	//	document.getElementById("ACTFEEDID").innerHTML = feed; */

		var toolbar_query = parent.Form.serialize("main_toolbar_form");

		var query = "backend.php?op=viewfeed&feed=" + feed + "&" +
			toolbar_query + "&subop=" + param_escape(subop);

		if (parent.document.getElementById("search_form")) {
			var search_query = parent.Form.serialize("search_form");
			query = query + "&" + search_query;
			parent.closeInfoBox(true);
		}

		if (getActiveFeedId() != feed) {
			cat_view_mode = is_cat;
		}

		var fe = document.getElementById("FEEDR-" + getActiveFeedId());

		if (fe) {
			fe.className = fe.className.replace("Selected", "");
		}

		setActiveFeedId(feed);

/*		var query = "backend.php?op=viewfeed&feed=" + param_escape(feed) +
			"&skip=" + param_escape(skip) + "&subop=" + param_escape(subop) +
			"&view=" + param_escape(view_mode) + "&limit=" + limit + 
			"&smode=" + param_escape(search_mode); */
	
		if (subop == "MarkAllRead") {

			var feedr = document.getElementById("FEEDR-" + feed);
			var feedctr = document.getElementById("FEEDCTR-" + feed);

			if (feedr && feedctr) {
		
				feedctr.className = "invisible";
	
				if (feedr.className.match("Unread")) {
					feedr.className = feedr.className.replace("Unread", "");
				}
			}

			var feedlist = document.getElementById('feedList');
			
			var next_unread_feed = getRelativeFeedId(feedlist,
					getActiveFeedId(), "next", true);

			if (next_unread_feed && getCookie('ttrss_vf_catchupnext') == 1) {
				query = query + "&nuf=" + param_escape(next_unread_feed);
				setActiveFeedId(next_unread_feed);
			}
		}
	
//		if (search_query != "") {
//			query = query + "&search=" + param_escape(search_query);
//			searchbox.value = "";
//		}

		if (cat_view_mode) {
			query = query + "&cat=1";
		}

		var headlines_frame = parent.frames["headlines-frame"];

		if (navigator.userAgent.match("Opera")) {
			var date = new Date();
			var timestamp = Math.round(date.getTime() / 1000);
			query = query + "&ts=" + timestamp
		}

		parent.debug(query);

		headlines_frame.location.href = query;
	
//		cleanSelectedList("feedList");
	
		var feedr = document.getElementById("FEEDR-" + getActiveFeedId());
		if (feedr && !feedr.className.match("Selected")) {	
			feedr.className = feedr.className + "Selected";
		} 
		
		parent.disableContainerChildren("headlinesToolbar", false);
		parent.Form.enable("main_toolbar_form");

	
	//	notify("");
	} catch (e) {
		exception_error("viewfeed", e);
	}		
}

function localHotkeyHandler(keycode) {

	if (keycode == 65) { // a
		return parent.toggleDispRead();
	}

	if (keycode == 85) { // u
		if (parent.getActiveFeedId()) {
			return viewfeed(parent.getActiveFeedId(), 0, "ForceUpdate");
		}
	}

	if (keycode == 82) { // r
		return parent.scheduleFeedUpdate(true);
	}

	var feedlist = document.getElementById('feedList');

	if (keycode == 74) { // j
		var feed = getActiveFeedId();
		var new_feed = getRelativeFeedId(feedlist, feed, 'prev');
		if (new_feed) viewfeed(new_feed, 0, '');
	}

	if (keycode == 75) { // k
		var feed = getActiveFeedId();
		var new_feed = getRelativeFeedId(feedlist, feed, 'next');
		if (new_feed) viewfeed(new_feed, 0, '');
	}

//	alert("KC: " + keycode);

}

function toggleCollapseCat(cat) {
	try {
		if (!xmlhttp_ready(xmlhttp)) {
			printLockingError();
			return;
		}
	
		var cat_elem = document.getElementById("FCAT-" + cat);
		var cat_list = document.getElementById("FCATLIST-" + cat).parentNode;
		var caption = document.getElementById("FCAP-" + cat);
		
		if (cat_list.className.match("invisible")) {
			cat_list.className = "";
			caption.innerHTML = caption.innerHTML.replace("...", "");
			if (cat == 0) {
				setCookie("ttrss_vf_uclps", "0");
			}
		} else {
			cat_list.className = "invisible";
			caption.innerHTML = caption.innerHTML + "...";
			if (cat == 0) {
				setCookie("ttrss_vf_uclps", "1");
			}
		}

		xmlhttp_rpc.open("GET", "backend.php?op=feeds&subop=collapse&cid=" + 
			param_escape(cat), true);
		xmlhttp_rpc.onreadystatechange=rpc_pnotify_callback;
		xmlhttp_rpc.send(null);

	} catch (e) {
		exception_error("toggleCollapseCat", e);
	}
}

function init() {
	try {
		if (arguments.callee.done) return;
		arguments.callee.done = true;		
		
		parent.debug("in feedlist init");
		
		hideOrShowFeeds(document, getCookie("ttrss_vf_hreadf") == 1);
		document.onkeydown = hotkey_handler;
		parent.setTimeout("timeout()", 0);

		parent.debug("about to remove splash, OMG!");

		var o = parent.document.getElementById("overlay");

		if (o) {
			o.style.display = "none";
			parent.debug("removed splash!");
		}

	} catch (e) {
		exception_error("feedlist/init", e);
	}
}
