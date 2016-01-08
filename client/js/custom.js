$(document).ready(function(){
	var url = window.location.pathname;
	var last_part = url.substr(url.lastIndexOf('/') + 1);

	$('.nav li a').each(function(){
		if((last_part ==  $(this).attr('href')) || (last_part == '' && $(this).attr('href') == window.location.href))
		{
			$(this).addClass('active');
		}
	});

	$(".vcontrols").click(function() {
		player = document.getElementById('rsound');
		$('.vcontrols').removeClass('on');
		$(this).addClass('on');
		if($(this).hasClass('yes')){
			setTimeout(function(){
				player.play();
			},500);
		}
		else{
			player.pause();
		}
	});

});