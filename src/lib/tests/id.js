import { renderRss2 } from '../../utils/util';

let deal = async (ctx) => {
	let { uid } = ctx.req.param();
	let url=`https://hjd2048.com/2048/thread.php?fid=${uid}`;
	const res = await fetch(url, {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
		}
	});
	const rest = await res.text();
	let urlid=rest.matchAll(/tid=[2-9]\d{7}/gm);
    let newurl=[];
    for(let item of urlid){
        newurl.push(item[0]);
    }
    newurl=[...new Set(newurl)].map(item=>'https://hjd2048.com/2048/read.php?'+item);



	function extractDivContent(html,targetClass) {
			let stack = [];
			let result = null;
			let currentIndex = 0;
			const startTagRegex = /<div([^>]*)>/g;
			const endTagRegex = /<\/div>/g;
			const classRegex = new RegExp(`class=["'][^"']*\\b${targetClass}\\b[^"']*["']`);
			while (currentIndex < html.length) {
				startTagRegex.lastIndex = currentIndex;
				const startMatch = startTagRegex.exec(html);
				endTagRegex.lastIndex = currentIndex;
				const endMatch = endTagRegex.exec(html);
				if (!startMatch && !endMatch) break;
				if (startMatch && (!endMatch || startMatch.index < endMatch.index)) {
					const fullTag = startMatch[0];
					const attributes = startMatch[1];
					const isTargetDiv = classRegex.test(attributes);
					stack.push({
						index: startMatch.index,
						isTarget: isTargetDiv
					});
					currentIndex = startMatch.index + fullTag.length;
				} else if (endMatch) {
					if (stack.length > 0) {
						const startInfo = stack.pop();
						if (startInfo.isTarget && result === null) {
							result = html.substring(startInfo.index, endMatch.index + 6); 
							break;
						}
					}  
					currentIndex = endMatch.index + 6;
				}
			}
		return result;
	}


	const items = await Promise.all(newurl.map(async (item) => {
        const res = await fetch(item, {
            headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        })
        const resText = await res.text();
        let title=[...resText.matchAll(/<h1 .*?>(.*?)<\/h1>/gmi)][0][1];
        let author=[...resText.matchAll(/<b.*?class="fl black".*?""><a.*?>(.*?)<\/a><\/b>/gm)][0][1];
        let des=extractDivContent(resText,'tpc_content');
        let pubdate=[...resText.matchAll(/<span.*?class="fl gray".*?title="(.*?)".*?<\/span>/gm)][0][1]+':00';
        return {
            title: title,
		    		link: item,
		   		 	description: des,
		    		pubDate: pubdate,
		    		guid: item,
		    		author: author,
        };
    ctx.header('Content-Type','application/xml');
	return ctx.body(renderRss2({
        title: '2048',
        link: 'https://hjd2048.com/2048/',
        description: '2048',
        language: 'zh-cn',
        items: items,
    }));

    }
}

let setup = (route) => {
	route.get('/2048/:uid', deal);
};

export default { setup }
