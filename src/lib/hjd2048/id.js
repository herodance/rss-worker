import { renderRss2 } from '../../utils/util';

let deal = async (ctx) => {
	let uid = ctx.req.param('uid');
	let id = ctx.req.param('id') ?? ''
	let url = `https://hjd2048.com/2048/thread.php?fid=${uid}`;
	let uid_content = { "15": "国内原创", "3": "最新合集", "4": "亚洲无码", "5": "日本骑兵", "13": "欧美新片", "16": "中文原创", "18": "三级写真", "320": "优质图片", "343": "实时BT", "23": "网友自拍", "57": "聚友客栈", "135": "原创达人", "28": "卡通动漫", "359": "AV情报" }
	const res = await fetch(url, {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
		}
	});
	const rest = await res.text();
	let urlid = rest.matchAll(/tid=\d+/gm);
	let newurl = [];
	for (let item of urlid) {
		newurl.push(item[0]);
	}
	newurl = [...new Set(newurl)].map(item => 'https://hjd2048.com/2048/read.php?' + item).slice(0, 40);



	let items = await Promise.all(newurl.map(async (item) => {
		const res = await fetch(item, {
			headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
		})
		const resText = await res.text();
		let title = resText.match(/<h1 .*?>(.*?)<\/h1>/)?.[1];
		let author = resText.match(/<b.*?class="fl black".*?""><a.*?>(.*?)<\/a><\/b>/)?.[1];
		if(id){if(author!==id){return ''}}
		let des = extractDivContent(resText, 'tpc_content');
		if (des?.includes('data-original')) {
			des = des.replaceAll('src', 'data-src');
			des = des.replaceAll('data-original', 'src');
		}
		let pubdate = resText.match(/<span.*?class="fl gray".*?title="(.*?)".*?<\/span>/)?.[1]
		pubdate=new Date(pubdate?.replace(/\s/g,'T')+'+08:00').toUTCString()
		return {
			title: title,
			link: item,
			description: des,
			pubDate: pubdate,
			guid: item,
			author: author,
		};
	}));
	items = items.filter(el => el !== '')
	ctx.header('Content-Type', 'application/xml');
	return ctx.body(renderRss2({
		title: `${uid_content[uid]}${id?'-'+id:id}-hjd2048`,
		link: `https://hjd2048.com/2048/thread.php?fid=${uid}`,
		description: '2048核基地',
		language: 'zh-cn',
		items: items,
	}));
}

	function extractDivContent(html, targetClass) {
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

let setup = (route) => {
	route.get('/2048/:uid/:id?', deal);
};

export default { setup }
