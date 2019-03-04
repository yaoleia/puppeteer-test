const fs = require('fs');
const puppeteer = require('puppeteer');

async function downMusic(music) {
    const browser = await (puppeteer.launch({ headless: false }));
    const search = music.split(" ");
    const [songName, singer] = search;
    try {
        const page = await browser.newPage();
        // 进入页面
        await page.goto('https://music.163.com/#');

        // 点击搜索框拟人输入 songName
        await page.type('.txt.j-flag', music);

        // 回车
        await page.keyboard.press('Enter');

        // 获取歌曲列表的 iframe

        // await page.waitFor(2000)
        // await page.waitForSelector("#m-search");

        let iframe = await page.frames().find(f => f.name() === 'contentFrame');

        await iframe.waitForSelector('.srchsongst')

        const SONG_LS_SELECTOR = await iframe.$('.srchsongst');

        // 获取歌曲 songName 的列表信息
        let songList = await iframe.evaluate(e => {
            const songList = Array.from(e.childNodes);
            return songList.map(v => {
                return {
                    title: v.childNodes[1].querySelector('[title]').title,
                    href: v.childNodes[1].querySelector('a').href,
                    singer: v.childNodes[3].innerText
                };
            });
        }, SONG_LS_SELECTOR);
        // console.log(songList)

        // 进入歌曲页面
        songList = songList.filter(s => !!s);
        const selected = songList.find(s => {
            if (!singer) {
                return s.title.indexOf(songName) != -1
            }
            return s.singer.indexOf(singer) != -1 && s.title.indexOf(songName) != -1
        });

        await page.goto(selected ? selected.href : songList[0].href);

        // 获取歌曲页面嵌套的 iframe        
        iframe = await page.frames().find(f => f.name() === 'contentFrame');

        // 点击 展开按钮
        await iframe.waitForSelector("#flag_ctrl");

        const unfoldButton = await iframe.$('#flag_ctrl');
        await unfoldButton.click();

        // 获取歌词
        const LYRIC_SELECTOR = await iframe.$('#lyric-content');
        const lyricCtn = await iframe.evaluate(e => {
            return e.innerText;
        }, LYRIC_SELECTOR);

        // console.log(lyricCtn);

        // 截图
        await page.screenshot({
            path: `${songName}.png`,
            fullPage: true,
        });

        // 写入文件
        let writerStream = fs.createWriteStream(`${songName}.txt`);
        writerStream.write(lyricCtn, 'UTF8');
        writerStream.end();

        // 获取评论数量
        const commentCount = await iframe.$eval('.sub.s-fc3', e => e.innerText);
        // console.log(commentCount);

        // 获取评论
        const commentList = await iframe.$$eval('.itm', elements => {
            const ctn = elements.map(v => {
                return v.innerText.replace(/\s/g, '');
            });
            return ctn;
        });
        // console.log(commentList);
    } catch (error) {
        console.error(error)
    } finally {
        await browser.close()
    }
}

const list = ["时间是金 王以太", "光年之外"]

list.forEach(li => downMusic(li))