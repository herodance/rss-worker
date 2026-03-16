import { renderRss2 } from '../../utils/util';

let deal = async (ctx) => {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    const res = await fetch('https://daily.zhihu.com/', { headers })
    const data = await res.text()
    const url_id = data.matchAll(/story\/\d+/g)
    let url = []
    for (let item of url_id) {
        url.push(item[0])
    }
    url = url.map((item) => { return `https://daily.zhihu.com/api/4/${item}` })

    const items = await Promise.all(url.map(async (item) => {
        const res1 = await fetch(item, { headers })
        const html = await res1.json()
        let description = html.body
				description = description.replaceAll(/pic-out/gi, 'pica')
        const title = html.title
        const link = html.share_url
        const pubDate = new Date(html.publish_time * 1000).toUTCString()
        const author = description.match(/<span class="author">([^，<]+)/)?.[1]
        return {
            title: title,
            link: link,
            description: description,
            pubDate: pubDate,
            guid: link,
            author: author,
        };
    }))
    ctx.header('Content-Type', 'application/xml');
    return ctx.body(renderRss2({
        title: `知乎日报`,
        link: `https://daily.zhihu.com/`,
        description: '每日提供高质量新闻资讯',
        language: 'zh-cn',
        items: items,
    }));
}

let setup = (route) => {
    route.get('/zhihu/:uid', deal);
};


export default { setup }
