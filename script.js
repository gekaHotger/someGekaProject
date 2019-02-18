
var iterator =0;
var canAdd = true;
var backgroundColor  = '#737373';
var textColor  = 'white';
var listHeight = 0;
var requestParams = {
    0: {
        site: 'https://www.youtube.com',
        el: 'detailpage',
        sts: '17940'
    },
    1: {
        site: 'https://www.youtube.com',
        el: 'embedded',
        sts: '17940'
    },
    2: {
        site: 'https://www.youtube-nocookie.com',
        el: 'embedded',
        sts: '17940'
    },
    3: {
        site: 'https://www.youtube-nocookie.com',
        el: 'detailpage',
        sts: '17940'
    }
};

function getVideoInfo () {
    sendRequest();
}

function sendRequest() {
    let from = location.href.search('=');
    let to = location.href.length;
    let id = location.href.substring(from+1,to);
    let xhr = new XMLHttpRequest();

    xhr.open('GET', requestParams[iterator].site+'/get_video_info?video_id='+id+'&eurl='+encodeURIComponent(location.href)+'&el='+requestParams[iterator].el+'&sts='+requestParams[iterator].sts, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            console.log(xhr.responseText);
        } else {
            if(typeof youtube_data_parser(xhr.responseText).video_info == 'undefined') {
                iterator ++;
                if( iterator < 4) {
                    sendRequest();
                }else {
                    canAdd = true;
                    iterator = 0;
                }
            }else {
                iterator = 0;
                appendButtons(youtube_data_parser(xhr.responseText).video_info);
            }
        }
    }
}

function qsToJson (qs) {
    var res = {};
    var pars = qs.split('&');
    var kv, k, v;
    for (i in pars) {
        kv = pars[i].split('=');
        k = kv[0];
        v = kv[1];
        res[k] = decodeURIComponent(v);
    }

    return res;
}

function youtube_data_parser (data) {
    var get_video_info = qsToJson(data);
    if(get_video_info.status == 'fail') {
        return {status:"error", code: "invalid_url",  msg : "check your url or video id"};
    } else {
        var tmp = get_video_info["url_encoded_fmt_stream_map"];
        if (tmp) {
            tmp = tmp.split(',');
            for (i in tmp) {
                tmp[i] = qsToJson(tmp[i]);
            }
            get_video_info["url_encoded_fmt_stream_map"] = tmp;
        }
        var tmp1 = get_video_info["player_response"];
        if (tmp1) {
            get_video_info["player_response"] = JSON.parse(tmp1);
        }
        var keywords = get_video_info["keywords"];
        if (keywords) {
            key_words = keywords.replace(/\+/g,' ').split(',');
            for (i in key_words) {
                keywords[i] = qsToJson(key_words[i]);
            }
            get_video_info["keywords"] = {all:keywords.replace(/\+/g,' '), arr: key_words};
        }

        return {status: 'success', raw_data:qsToJson(data), video_info:get_video_info};
    }
}

function appendButtons(link) {
    let dwBtn = createDownloadBtn(link);
    let dwDiv = createBtnWrapper();
    let optionsList = createOptionsList(link);
    let selectBtn = createSelectBtn();
    dwDiv.appendChild(dwBtn);
    dwDiv.appendChild(selectBtn);
    dwDiv.appendChild(optionsList);

    document.querySelectorAll('.ytd-menu-renderer >  ytd-toggle-button-renderer')[0].parentElement.appendChild(dwDiv);
    canAdd = true;
    listHeight = document.getElementById('2convOptionList').clientHeight;
    document.getElementById('2convOptionList').style.height = 0+'px';
}

function createBtnWrapper() {
    let dwDiv = document.createElement('div');
    dwDiv.style.marginTop = '5px';
    dwDiv.style.width = '81px';
    dwDiv.style.float = 'left';
    dwDiv.style.position = 'relative';

    return dwDiv
}

function createDownloadBtn(link) {
    let dwBtn = document.createElement('a');
    let dwImg = document.createElement('img');
    let href = {
        url: '',
        height: 0
    };

    link.player_response.streamingData.formats.forEach(function(link) {
        if(link.height * 1 > href.height) {
            href.height = link.height * 1;
            href.url = link.url;
        }
    });

    dwBtn.href = href.url+'&title='+encodeURIComponent(link.title);
    dwBtn.download = link.title.replace(/\+/g,' ');
    dwBtn.title = link.title.replace(/\+/g,' ');
    dwBtn.style.marginLeft = '5px';

    dwImg.src ='data:image/png;base64,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';
    dwImg.style.width='26px';
    dwImg.style.height ='26px';
    dwBtn.appendChild(dwImg);

    return dwBtn
}

function createSelectBtn() {
    let selectBtn = document.createElement('div');
    selectBtn.innerHTML ='others format';

    selectBtn.style.background = backgroundColor;
    selectBtn.style.color = textColor;
    selectBtn.style.cursor= 'pointer';
    selectBtn.style.float= 'right';
    selectBtn.style.height= '24px';
    selectBtn.style.hover= 'right';
    selectBtn.style.paddingTop = '2px';
    selectBtn.style.textAlign = 'center';
    selectBtn.style.width = '50px';

    selectBtn.onclick = function () { document.getElementById('2convOptionList') .style.height = listHeight+'px'; };
    selectBtn.onmouseover = function () { this.style.background = 'gray'; }.bind(selectBtn);
    selectBtn.onmouseout = function () { this.style.background = backgroundColor; }.bind(selectBtn);
    selectBtn.classList.add('2conv');

    return selectBtn;
}

function createOptionsList(links) {
    let optionsListWrapper = document.createElement('div');
    let optionsList = document.createElement('div');
    let optionsUl = document.createElement('ul');

    links.player_response.streamingData.formats.forEach(function (link) {
        optionsUl.appendChild(createLi(link,links.title));
    });
    links.player_response.streamingData.adaptiveFormats.forEach(function (link) {
        optionsUl.appendChild(createLi(link,links.title));
    });

    optionsUl.style.listStyleType ='none';
    optionsUl.style.textAlign ='justify';
    optionsUl.style.paddingLeft = '15px';

    optionsListWrapper.style.height ='0px';
    optionsListWrapper.style.left ='5px';
    optionsListWrapper.style.position ='absolute';
    optionsListWrapper.style.top ='26px';
    optionsListWrapper.style.zIndex ='100';

    optionsList.style.background = backgroundColor;
    optionsList.style.boxShadow = '0px 12px 16px -5px rgba(0,0,0,0.75)';
    optionsList.style.overflow ='hidden';
    optionsList.style.position ='relative';
    optionsList.style.transition ='height 0.5s ease-in-out';
    optionsList.style.width ='180px';

    optionsList.id='2convOptionList';

    optionsList.appendChild(optionsUl);
    optionsListWrapper.appendChild(optionsList);

    return optionsListWrapper;
}

function createLi(link,title) {
    let a = document.createElement('a');
    let li = document.createElement('li');
    li.style.paddingBottom = '5px';
    a.innerText =  formats [link.itag]+'. '+(Math.floor(Math.floor(link.contentLength /1024)/1024))+'mb';
    a.style.color ='white';
    a.style.cursor = 'pointer';
    a.style.fontSize = '11px';
    a.style.textDecoration = 'none';
    a.classList.add('2conv');
    a.download = '';
    a.title = title.replace(/\+/g,' ');
    a.href = link.url+'&title='+encodeURIComponent(title);
    li.append(a);
    return li
}

var formats = {
    5 : 'FLV 240p',
    6 : 'FLV 270p',
    18 : 'MP4 360p',
    22 : 'MP4 720',
    34 : 'FLV 360p',
    35 : 'FLV 480p',
    37 : 'MP4 1080',
    38 : 'MP4 8k',
    59 : 'MP4 480',
    78 : 'MP4 480',
    82 : 'MP4 360 3d',
    83 : 'MP4 240 3d',
    84 : 'MP4 720 3d',
    85 : 'MP4 1080 3d',
    160 : 'MP4 144 noAudio',
    133 : 'MP4 240 noAudio',
    134 : 'MP4 360 noAudio',
    135 : 'MP4 480 noAudio',
    136 : 'MP4 720 noAudio',
    137 : 'MP4 1080 noAudio',
    212 : 'MP4 480 noAudio',
    213 : 'MP4 480 noAudio',
    214 : 'MP4 720 noAudio',
    215 : 'MP4 720 noAudio',
    264 : 'MP4 1440 noAudio',
    138 : 'MP4 8k noAudio',
    298 : 'MP4 720 noAudio',
    299 : 'MP4 1080 noAudio',
    266 : 'MP4 4k noAudio',
    43 : 'WebM 360',
    44 : 'WebM 480',
    45 : 'WebM 720',
    46 : 'WebM 1080',
    167 : 'WebM 360 noAudio',
    168 : 'WebM 480 noAudio',
    169 : 'WebM 720 noAudio',
    170 : 'WebM 1080 noAudio',
    218 : 'WebM 480 noAudio',
    219 : 'WebM 480 noAudio',
    242 : 'WebM 240 noAudio',
    243 : 'WebM 360 noAudio',
    244 : 'WebM 480 noAudio',
    245 : 'WebM 480 noAudio',
    246 : 'WebM 480 noAudio',
    247 : 'WebM 720 noAudio',
    248 : 'WebM 1080 noAudio',
    271 : 'WebM 1440 noAudio',
    272 : 'WebM 8k noAudio',
    278 : 'WebM 144 noAudio',
    100 : 'WebM 360 3d',
    101 : 'WebM 480 3d',
    102 : 'WebM 720 3d',
    302 : 'WebM 720 noAudio',
    303 : 'WebM 1080 noAudio',
    308 : 'WebM 1440 noAudio',
    313 : 'WebM 4k noAudio',
    315 : 'WebM 4k noAudio',
    330 : 'WebM 144 noAudio',
    331 : 'WebM 240 noAudio',
    332 : 'WebM 360 noAudio',
    333 : 'WebM 480 noAudio',
    334 : 'WebM 720 noAudio',
    335 : 'WebM 1080 noAudio',
    336 : 'WebM 1440 noAudio',
    337 : 'WebM 2160 noAudio',
    398 : 'WebM 720 noAudio',
    397 : 'WebM 480 noAudio',
    396 : 'WebM 360 noAudio',
    395 : 'WebM 240 noAudio',
    394 : 'WebM 144 noAudio',
    17 : '3GP 144',
    36 : '3GP 240',
    139 : 'Audio 48kbps AAC',
    140 : 'Audio 128kbps AAC',
    141 : 'Audio 256kbps AAC',
    256 : 'Audio 192kbps AAC',
    258 : 'Audio 384kbps AAC',
    325 : 'Audio 384kbps AAC',
    328 : 'Audio 384kbps AAC',
    380 : 'Audio 384kbps AAC',
    171 : 'Audio 128kbps webm',
    172 : 'Audio 192kbps webm',
    249 : 'Audio 48kbps opus',
    250 : 'Audio 128kbps opus',
    251 : 'Audio 256kbps opus',
};

onmousedown = function () {
    if(document.getElementsByClassName('2conv').length > 0 && !event.target.classList.contains('2conv')){
        document.getElementById('2convOptionList').style.height='0px';
    }
};

window.onload = function() {
    document.body.addEventListener('DOMSubtreeModified', function () {
        if(location.href !== 'https://www.youtube.com/' && document.getElementsByClassName('2conv').length < 1 && canAdd &&  document.getElementById('info') != null) {
            canAdd = false;
            getVideoInfo();
        }
    }, false);
};
