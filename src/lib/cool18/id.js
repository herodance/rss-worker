import { renderRss2 } from '../../utils/util';
let deal = async (ctx) =>{
	const {uid} = ctx.req.param();
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Cookie': 'isok=true'
  }
	const id={"sfyc":"https://www.cool18.com/indexorgposts.php","jjsw":"https://www.cool18.com/bbs4/index.php","qswj":"https://www.cool18.com/bbs5/index.php","xqtt":"https://www.cool18.com/bbs/index.php","sfzp":"https://www.cool18.com/bbs6/index.php","ssdm":"https://www.cool18.com/bbs7/index.php","qsly":"https://www.cool18.com/bbs2/index.php"} 
	const id_content={"sfyc":"私房原创","jjsw":"禁忌书屋","qswj":"情色无忌","xqtt":"性趣贴图","sfzp":"私房自拍","ssdm":"色色动漫","qsly":"情色靓影"}
	const res = await fetch(id[uid],{headers})
  const text = await res.text()
  let url_id=[]
	if(uid==="sfyc"){
  const idu = text.matchAll(/http.*?tid=\d+/g)
  for (const item of idu) {
    url_id.push(item[0])
  }}else{
	const idu=JSON.parse(text.match(/\[{[\S\s]*?}]/)[0])
	for (const item of idu) {
		if(item["size"]>200){url_id.push(item["tid"])}
	}
	url_id=url_id.map(item=>id[uid]+`?app=forum&act=threadview&tid=`+item)
	}
	url_id=url_id.slice(0,48)
  const items=await Promise.all(url_id.map(async (item) => {
  const res = await fetch(item,{headers})
  const text = await res.text()
  const content=text.match(/<pre>([\s\S]*)<\/pre>/)?.[1]
  const title=text.match(/<h1 class="main-title">(.*)<\/h1>/)?.[1]
  let pubTime=text.match(/于 (\d+-\d+-\d+ \d+:\d+)/)?.[1].replace(/(\s)(\d):/,'$10$2:')
  pubTime=new Date(pubTime.replace(/\s/g,'T')+'+08:00').toUTCString()
  const author1=text.match(/<a.*?title=.*?发送消息.*?>([\S\s]*?)<\/a>/)?.[1]
		const author=author1.match(/[a-zA-Z0-9\u4e00-\u9fa5]+/)?.[0]
  return {
    title: title,
		link: item,
		description: content,
		pubDate: pubTime,
		guid: item,
		author: author,
  }
  }))
  ctx.header('Content-Type','application/xml');
	return ctx.body(renderRss2({
        title: `${id_content[uid]}-酷18`,
        link: id[uid],
        description: '酷18',
        language: 'zh-cn',
        items: items,
    }))
  
}

let setup = (route) => {
	route.get('/cool18/:uid', deal);
};

export default { setup }
