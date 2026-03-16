import { renderRss2 } from '../../utils/util';

let deal = async (ctx) => {
    let { uid } = ctx.req.param();
    const headers = new Headers({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    })
    const response = await fetch('https://www.1lou.me/', { headers });
    const resText = await response.text();
    let id = resText.matchAll(/thread-\d+/g)
    let url = []
    for (let i of id) {
        url.push(`https://www.1lou.me/${i[0]}.htm`)
    }
    url = [...new Set(url)].slice(0, 40)
    let items = await Promise.all(url.map(async (item) => {
        const res = await fetch(item, { headers })
        const resT = await res.text();
        let des = extractDivContent(resT, 'message break-all');
        const pubDate = resT.match(/<span class="date.*?>(.*?)<\/span>/)?.[1];
        const author = resT.match(/<a href="user-\d+\.htm".*?>(.*?)<\/a>/)?.[1];
        const title = resT.match(/([^>\n\r	]*?)<\/h4>/)?.[1];
        return {
            title: title,
            link: item,
            description: des,
            pubDate: pubDate,
            guid: item,
            author: author,
        }
    }))
    ctx.header('Content-Type', 'application/xml');
    return ctx.body(renderRss2({
        title: `首页-1lou`,
        link: `https://www.1lou.me/`,
        description: '1lou.me',
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
    route.get('/btzj/:uid', deal);
};

export default { setup }
