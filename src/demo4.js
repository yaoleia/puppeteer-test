const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    const browser = await (puppeteer.launch({ headless: false }));
    const musicName = '时间是金';

    try {
        const page = await browser.newPage();
        // 进入页面
        await page.goto('https://music.163.com/#');

        // 点击搜索框拟人输入 musicName
        await page.type('.txt.j-flag', musicName);

        // 回车
        await page.keyboard.press('Enter');

        // 获取歌曲列表的 iframe
        await page.waitFor(3000);

        let iframe = await page.frames().find(f => f.name() === 'contentFrame');
        const SONG_LS_SELECTOR = await iframe.$('.srchsongst');

        // 获取歌曲 musicName 的列表信息
        const songList = await iframe.evaluate(e => {
            const songList = Array.from(e.childNodes);
            return songList.map(v => {
                if (v.querySelector('.s-fc7')) {
                    return {
                        title: v.querySelector('.s-fc7').innerText + v.childNodes[1].querySelector('[title]').title,
                        href: v.childNodes[1].querySelector('a').href,
                        singer: v.childNodes[3].querySelector('a').innerText
                    };
                }
            });
        }, SONG_LS_SELECTOR);

        // 进入歌曲页面
        const selected = songList.find(s => s.title.indexOf(musicName) != -1);
        await page.goto(selected.href);

        // 获取歌曲页面嵌套的 iframe
        await page.waitFor(2000);
        iframe = await page.frames().find(f => f.name() === 'contentFrame');

        // 点击 展开按钮
        const unfoldButton = await iframe.$('#flag_ctrl');
        await unfoldButton.click();

        // 获取歌词
        const LYRIC_SELECTOR = await iframe.$('#lyric-content');
        const lyricCtn = await iframe.evaluate(e => {
            return e.innerText;
        }, LYRIC_SELECTOR);

        console.log(lyricCtn);

        // 截图
        await page.screenshot({
            path: '歌曲.png',
            fullPage: true,
        });

        // 写入文件
        let writerStream = fs.createWriteStream('歌词.txt');
        writerStream.write(lyricCtn, 'UTF8');
        writerStream.end();

        // 获取评论数量
        const commentCount = await iframe.$eval('.sub.s-fc3', e => e.innerText);
        console.log(commentCount);

        // 获取评论
        const commentList = await iframe.$$eval('.itm', elements => {
            const ctn = elements.map(v => {
                return v.innerText.replace(/\s/g, '');
            });
            return ctn;
        });
        console.log(commentList);
    } catch (error) {
        console.error(error)
    } finally {
        await browser.close()
    }
})();