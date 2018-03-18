import needle from 'needle';
import { config } from './config';

const fs = require('fs');

const num = 9;
const apiLink = `https://www.instagram.com/${config.username}/?__a=1`;

const options = {
  headers: {
    'Referer': 'https://www.instagram.com/',
    'Host': 'www.instagram.com',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Accept-Language': 'ru',
    'Accept-Encoding': 'gzip, deflate',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0.2 Safari/604.4.7',
    'Cookie': 'ig_or=; ig_pr=1; ig_vh=794; ig_vw=690',
    'Cache-Control': 'max-age=0'
  },
  cookies: {
    'ig_or': '',
    'ig_pr': '1',
    'ig_vh': '794',
    'ig_vw': '690'
  }
};


needle.get('https://instagram.com', options, (err, res) => {
  if (err) console.log(err);
  console.log(res);
})

let options2 = {
   headers: {
     'Referer': 'https://www.instagram.com/',
     'Content-Type': 'application/x-www-form-urlencoded',
     'Origin': 'https://www.instagram.com',
     'Host': 'www.instagram.com',
     'Accept': '*/*',
     'Connection': 'keep-alive',
     'Accept-Language': 'ru',
     'Accept-Encoding': 'gzip, deflate',
     'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0.2 Safari/604.4.7',
     'Cookie': 'ig_pr=1; ig_vh=794; ig_vw=690; csrftoken=yACZYlvepaDYedA5Wc4HyrmXiowLH4WX; rur=FTW; mid=Wkix3wAEAAHqQepB63WONy6IuSSr',
     'X-Instagram-AJAX': '1',
     'X-CSRFToken': 'yACZYlvepaDYedA5Wc4HyrmXiowLH4WX',
     'X-Requested-With': 'XMLHttpRequest'
  },
  cookies: {
    'csrftoken': 'yACZYlvepaDYedA5Wc4HyrmXiowLH4WX',
    'mid': 'WkifwgAEAAFDpTO-QEvQXQj_MklU',
    'rur': 'FTW'
  }

// needle.post('https://instagram.com/accounts/login/ajax', data, options2, (err, res) => {
//   if (err) console.log(err);
//   console.log(res.headers);
//   console.log(res.cookies);
// })


async function getPhoto(link) {
  return new Promise((resolve, reject) => {
    needle.get(link, (err, res) => {
      if (err) reject(new Error('I can\'t get page'));
        resolve({
            id: res.body.user.media.nodes[num].id,
            url: res.body.user.media.nodes[num].thumbnail_src,
            discription: res.body.user.media.nodes[num].caption || "нет описания"
          });
    });
  });
}

// проверяем локальный файл на id
async function lastPhotoId() {
  return new Promise((resolve, reject) => {
    fs.readFile('id_post.txt', 'utf-8', (err, data) => {
      if (err) reject(new Error('can\'t read file'));
        resolve(data);
    });
  });
};

//
async function getDate(url) {
  const sendMessageLink = `https://api.telegram.org/bot${config.bot_id}/sendMessage?chat_id=${config.chat_id}&parse_mode=HTML`;
  const photo = await getPhoto(url);
  const lastPhoto = await lastPhotoId();
    const data = {
      text: `${photo.discription}\n <a href="${photo.url}">link</a>`,
    }

    if (photo.id != lastPhoto) {
      // console.log(lastPhoto)
      needle.post(sendMessageLink, data, (err, res) => {
        if (err) new Error('oh err on send message to tg bot');
        // console.log('sucess');
        fs.writeFile('id_post.txt', `${photo.id}`, (err) => {
          if (err) throw err;
          // console.log('The file has been saved!');
        });
      });
    }
    else {
      console.log('photo exist');
    }
}

getDate(apiLink);
