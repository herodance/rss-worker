import { renderRss2 } from '../../utils/util';

let deal = async (ctx) => {
	const { uid } = ctx.req.param();
	const uid_content = { "yc": "原创", "qsyk": "轻松一刻", "cz": "槽值", "dgxm": "大国小民", "rj": "人间", "txs": "谈心社" }
	let url = `https://m.163.com/touch/exclusive/sub/${uid}`;
	if(uid==`yc`){url=`https://m.163.com/touch/exclusive`}	;
	const res = await fetch(url);
	const html = await res.text();
	const url_id = html.matchAll(/exclusive\/article\/[0-9,a-z,A-Z]+\.html/g)
	const url_content = [...url_id.map((id) => {
		return `https://m.163.com/${id[0]}`
	})]

	let items = await Promise.all(url_content.map(async (url) => {
		const res2 = await fetch(url);
		const html2 = await res2.text();
		let description = extractContent(html2, 'article-body js-article-body')
		if (!description) { return "" }
		description = description?.replaceAll(/\n/g, '') //去掉回车，影响正则表达式
		description = description?.replaceAll(/<img.*?data-src="(.*?)".*?>/g, '<img src="$1" referrerpolicy="no-referrer">') //替换图片
		description = description?.replaceAll(/<section[ ]+class="m.*?js-open-app.*?>.*?<\/section>/g, '') //删除投票 pk栏目
		description = description?.replaceAll(/<div    class="s-tip.*?>.*?打开网易新闻 查看精彩图片.*?<i class="icon-arrow">.*?<\/i>.*?<\/div>/g, '') //删除提示
		const title = html2.match(/<h1.*?>(.*?)<\/h1>/)?.[1]
		let pubDate = html2.match(/<time datetime=.*?>(.*?)<\/time>/)?.[1]
				pubDate = new Date(pubDate.replace(/\s/g,'T')+'+08:00').toUTCString()
		const author = html2.match(/<a class="author-homePage".*?>(.*?)<\/a>/)?.[1]
		return {
			title: title,
			link: url,
			description: description,
			pubDate: pubDate,
			guid: url,
			author: author
		}

	}
	)
	)
	items = items.filter(el => el !== '')
	ctx.header('Content-Type', 'application/xml');
	return ctx.body(renderRss2({
		title: '网易' + uid_content[uid],
		link: url,
		description: uid_content[uid],
		language: 'zh-cn',
		items: items,
	}));


}

function extractContent(html, targetClass) {
	let stack = [];
	let result = null;
	let currentIndex = 0;
	const startTagRegex = /<section([^>]*)>/g;
	const endTagRegex = /<\/section>/g;
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
	route.get('/m163/:uid', deal);
};

export default { setup }
