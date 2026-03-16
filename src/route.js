import { Hono } from 'hono';
import bilibili_user_dynamic from './lib/bilibili/user/dynamic';
import bilibili_user_video from './lib/bilibili/user/video';
import telegram_channel from './lib/telegram/channel';
import weibo_user from './lib/weibo/user';
import xiaohongshu_user from './lib/xiaohongshu/user';
import hjd2048_id from './lib/hjd2048/id';
import mei5_type from './lib/mei5/type';
import m163_yc from './lib/m163/yc';
import cool18_id from './lib/cool18/id'
import t66y_id from './lib/t66y/id'
import btzj_id from './lib/btzj/id'
import zhihu_id from './lib/zhihu/id'

const route = new Hono();

let plugins = [hjd2048_id,mei5_type,m163_yc,cool18_id,t66y_id,btzj_id,zhihu_id];

for (let plugin of plugins) {
	plugin.setup(route);
}

export default route;
