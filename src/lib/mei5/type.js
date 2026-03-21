import { renderRss2 } from '../../utils/util';

let deal=async (ctx)=> {
  let {uid}=ctx.req.param()
	let uid_content={"new": "最近更新","top": "站长推荐",}
  const headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  }
	
	//获取重定向网址
	const url_root='http://Xgmn8.Vip'
	const res_url=await fetch(url_root,{headers})
	const url_re=res_url.url
	//const url_re=`https://www.mei5.vip/`
	//const url_rer=`http://x1.876512.xyz/`
  //拼接网址，获取new top的内容
  let url=`${url_re}${uid}.html`
  const res=await fetch(url,{headers})
  const html=await res.text()
  const urlid=html.matchAll(/(Xiuren\/Xiuren|XingYan\/XingYan|MyGirl\/MyGirl|YouMi\/|IMiss\/IMiss)\d+/g)
  let urlarr=[]
  for(let item of urlid){
    urlarr.push(item[0])
  }
	//let items=[]
  let i=new Date()
  let ii=i.getHours()*2
  
  //map会触发请求过多错误，改用额外判定，每小时获取不同的网页
 /*for(let item of urlarr.slice(ii,ii+2)){
    let url_content=`${url_re}${item}.html`
		let guid_url=`http://www.mei5.vip/${item}.html`
    const res=await fetch(url_content,{headers})  
    const html=await res.text()
    let title=html.match(/<h1 class="article-title">(.*?)<\/h1>/)?.[1]
    let author=html.match(/\?keyword=(.*?)"/)?.[1]
    let date=html.match(/更新：([0-9.]+)/)?.[1]
    let pubDate=date.replaceAll('.','-')+` ${ii/2<10 ? `0`+ii/2 : ii/2}:00:00`
			pubDate=new Date(pubDate.replace(/\s/g,'T')+'+00:00').toUTCString()
    const reg_page=new RegExp(`${item}_[0-9]*`,'g')
    let url_page=html.matchAll(reg_page)
    let des_img=html.matchAll(/<img alt=.* title=.* src="\/(.*?)"/g)
    let des=[]
    for(let item of des_img){des.push(item[1])}
    let pagearr=[]
    for(let page of url_page){pagearr.push(page[0])}
    let des_page=await getDes(pagearr,url_re)
    let desarr=des.concat(des_page)
    let descr=desarr.map((item)=>{return `<img src="${url_re}${item}" referrerpolicy="no-referrer">`}).join('<br>')	
		if(descr){
			    items.push({
			      title:title,
			      link:url_content,
			      description:descr,
			      pubDate:pubDate,			
			      guid:guid_url,
			      author:author
			    })
			}
    }*/  
	//map会触发请求过多错误
  	let items=await Promise.all(urlarr.slice(ii,ii+2).map(async (item)=>{
    let url_content=`${url_re}${item}.html`
		let guid_url=`http://www.mei5.vip/${item}.html`
    const res=await fetch(url_content,{headers})  
    const html=await res.text()
    let title=html.match(/<h1 class="article-title">(.*?)<\/h1>/)?.[1]
   	let author=html.match(/\?keyword=(.*?)"/)?.[1]
    let date=html.match(/更新：([0-9.]+)/)?.[1]
    let pubDate=date.replaceAll('.','-')+` ${ii/2<10 ? `0`+ii/2 : ii/2}:00:00`
			pubDate=new Date(pubDate.replace(/\s/g,'T')+'+00:00').toUTCString()
    const reg_page=new RegExp(`${item}_[0-9]*`,'g')
    let url_page=html.matchAll(reg_page)
    let des_img=html.matchAll(/<img alt=.* title=.* src="\/(.*?)"/g)
    let des=[]
    for(let item of des_img){des.push(item[1])}
    let pagearr=[]
    for(let page of url_page){pagearr.push(page[0])}
    let des_page=await getDes(pagearr,url_re)
    let desarr=des.concat(des_page)
    let descr=desarr.map((item)=>{return `<img src="${url_re}${item}" referrerpolicy="no-referrer">`}).join('<br>')	
    return {
      title:title,
      link:url_content,
      description:descr,
      pubDate:pubDate,
      guid:guid_url,
      author:author
    }
  }))

	

  ctx.header('Content-Type', 'application/xml; charset=utf-8')
	ctx.header('Connection', 'close');
  ctx.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  ctx.header('Pragma', 'no-cache');
  ctx.header('Expires', '0');
  
  
	const rssBody = renderRss2({
	    title: `${uid_content[uid]}-Xgmn8`,
	    link: `${url_root}/${uid}.html`,
	    description: '美女图片',
	    language: 'zh-cn',
	    items: items,
	});
  const finalXml = rssBody.trim();
	return ctx.body(finalXml);
	/*return ctx.body(renderRss2({
        title:`${uid_content[uid]}-Xgmn8`,
        link: `${url_root}/${uid}.html`,
        description: '美女图片',
        language: 'zh-cn',
        items: items,
    }));*/
}


//批量获取页面图片函数，传入数组
async function getDes(pagearr,url_re){
  let headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  }
  let desarr=[...new Set(pagearr)]
  let deshtml=await Promise.all(desarr.map(async (item)=>{
    let url=`${url_re}${item}.html`
    const res=await fetch(url,{headers})  
    const html=await res.text()
    let des=[]
    let des_img=html.matchAll(/<img alt=.* title=.* src="\/(.*?)"/g)
    for(let item of des_img){
      des.push(item[1])
    }
    return des
  }))
  let desall=deshtml.flat()
  return desall
}

let setup = (route) => {
	route.get('/mei5/:uid', deal);
};

export default { setup }


  






