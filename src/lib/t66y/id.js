import { renderRss2 } from '../../utils/util';

let deal = async (ctx) => {
	let { uid } = ctx.req.param();
	let url_c = `https://t66y.com/thread0806.php?fid=${uid}`;
	let uid_content = {"7": "综合讨论区","25": "国产原创区","20": "成人文学交流区"}
	const headers={
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",}
	const respone=await fetch(url_c,{headers})
	const data=await respone.text()
	let url=[]
	const id=data.matchAll(/htm_data[\/\s\d]+/gi)
	for(let i of id){
		url.push(i[0])
	}
	url=url.map(i=>`https://t66y.com/`+ i +`.html`).slice(0,40)
	
	let items=await Promise.all(url.map(async i=>{
		const respone=await fetch(i,{headers})
		const data=await respone.text()
		const title=data.match(/<h4[^>]*?>([^<]+)<\/h4>/)?.[1]
		const timestrap=data.match(/data-timestamp="(.*?)"/)?.[1]
		const pubdate=new Date(timestrap*1000).toUTCString()
		const author=data.match(/<th.*?><b>(<span class="s3 f16">)?(.*?)(<\/span>)?<\/b>/m)?.[2]
		let des=extractDivContent(data,'tpc_content do_not_catch')
		des=des.replaceAll('ess-data','src')
		return {
			title: title,
			link: i,
			description: des,
			pubDate: pubdate,
			guid: i,
			author: author,
		};

		}))


	ctx.header('Content-Type', 'application/xml');
	return ctx.body(renderRss2({
		title: `${uid_content[uid]}-t66y`,
		link: url_c,
		description: '草榴社区',
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
	route.get('/t66y/:uid', deal);
};


export default { setup }



