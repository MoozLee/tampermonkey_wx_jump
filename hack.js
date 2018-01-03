// ==UserScript==
// @name         weixin_tiaotiao
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://mp.weixin.qq.com/
// @grant        GM_xmlhttpRequest
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/aes.js
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    //var CryptoJS = require('crypto-js');
    //var request = require('request-promise');
    /*
 * npm install crypto-js request-promise
 * node wx_t1t_hack.js
 */

    // export function testEncription(msg, fullKey) {
    //   var fullKey = fullKey.slice(0, 16)
    //   var key = CryptoJS.enc.Utf8.parse(fullKey)
    //   var iv = CryptoJS.enc.Utf8.parse(fullKey)

    //   var passWord = CryptoJS.AES.encrypt(msg, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
    //   var base64 = passWord.toString()

    //   console.log('passWord', passWord)
    //   console.log('sessionId', sessionId)
    //   console.log('key', key)
    //   console.log('base64', base64)

    //   var bytes = CryptoJS.AES.decrypt(base64, key, {
    //     iv: iv
    //   });
    //   console.log('bytes', bytes)
    //   var plaintext = CryptoJS.enc.Utf8.stringify(bytes);
    //   console.log('plaintext', plaintext)
    // }

    function encrypt (text, originKey) {
        originKey = originKey.slice(0, 16);
        var
        key = CryptoJS.enc.Utf8.parse(originKey),
            iv = CryptoJS.enc.Utf8.parse(originKey),
            msg = JSON.stringify(text);
        var ciphertext = CryptoJS.AES.encrypt(msg, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return ciphertext.toString();
    }

    function decrypt (text, originKey) {
        originKey = originKey.slice(0, 16);
        var
        key = CryptoJS.enc.Utf8.parse(originKey),
            iv = CryptoJS.enc.Utf8.parse(originKey);
        var bytes = CryptoJS.AES.decrypt(text, key, {
            iv: iv
        });
        var plaintext = CryptoJS.enc.Utf8.stringify(bytes);
        return plaintext;
    }

    function extend (target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for (var prop in source) {
                target[prop] = source[prop];
            }
        });
        return JSON.stringify(target);
    }


    var version = 5,
        score = 1000,
        playTimeSeconds = score * 0.01,
        // replace with your session_id here
        session_id = '';

    const sleep = (time) => {
        console.log(`sleeping ${time / 1000} second(s)....`);
        return new Promise(resolve => setTimeout(resolve, time));
    };
    const rand = (min, max) => Math.random() * (max - min) + min;
    const randInt = (min, max) => ~~rand(min, max);
    const sleepRand = (min, max) => sleep(rand(min, max));

    var headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_1 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C153 MicroMessenger/6.6.1 NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx7c8d593b2c3a7703/' + version + '/page-frame.html',
        'Content-Type': 'application/json',
        'Accept-Language': 'zh-cn',
        'Accept': '*/*'
    };
    var base_req = {
        'base_req': {
            'session_id': session_id,
            'fast': 1
        }
    };
    var base_site = 'https://mp.weixin.qq.com/wxagame/';

    /* jshint ignore:start */
    async function main() {
        let settlementRes, res

        //res = await request('POST', 'wxagame_getuserinfo')
        var path = 'wxagame_getuserinfo';
        await GM_xmlhttpRequest ( {
            method:     'POST',
            url:        base_site + path,
            data:       JSON.stringify(base_req),
            headers:    headers,
            onload:     async function (response) {
                console.log (response.responseText);
            }
        });

        await sleepRand(100, 300)
        path = 'wxagame_getfriendsscore';
        await GM_xmlhttpRequest ( {
            method:     'POST',
            url:        base_site + path,
            data:       JSON.stringify(base_req),
            headers:    headers,
            onload:     async function (response) {
                console.log (response.responseText);
                var times = JSON.parse(response.responseText).my_user_info.times + 1;
                await sleepRand(100, 300)
                path = 'wxagame_init';

                await GM_xmlhttpRequest ( {
                    method:     'POST',
                    url:        base_site + path,
                    data:       extend({}, {version: 9}, base_req),
                    headers:    headers,
                    onload:     async function (response) {
                        await sleepRand(playTimeSeconds * 0.9 * 1000, playTimeSeconds * 1.1 * 1000)

                        //console.log (response.responseText);
                        var action = [],
                            musicList = [],
                            touchList = [];
                        for (let i = 0; i < score; i++) {
                            action.push([rand(0.752, 0.852), rand(1.31, 1.36), false])
                            musicList.push(false)
                            touchList.push([randInt(180, 190), randInt(441, 456)])
                        }
                        var data = {
                            score: score,
                            times: times,
                            game_data: JSON.stringify({
                                seed: Date.now(),
                                action: action,
                                musicList: musicList,
                                touchList: touchList,
                                version: 1
                            })
                        };
                        var path = 'wxagame_settlement';
                        await GM_xmlhttpRequest ( {
                            method:     'POST',
                            url:        base_site + path,
                            data:       extend({}, {action_data: encrypt(data, session_id)}, base_req),
                            headers:    headers,
                            onload:     async function (response) {
                                //console.log (response.responseText);
                                path = 'wxagame_getfriendsscore';
                                GM_xmlhttpRequest ( {
                                    method:     'POST',
                                    url:        base_site + path,
                                    data:       JSON.stringify(base_req),
                                    headers:    headers,
                                    onload:     async function (response) {

                                        console.log('2018! Happy new year! 🎉');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    }
    main().catch(e => {
        console.error('Opps~ ERROR EXIT: ', e)
    })
    /* jshint ignore:end */


    /*request({
        method: 'POST',
        url: base_site + path,
        headers: headers,
        json: true,
        body: base_req
    }).then(function (response) {
        // console.log(response.my_user_info)
        var times = response.my_user_info.times + 1;
        path = 'wxagame_init';
        request({
            method: 'POST',
            url: base_site + path,
            headers: headers,
            json: true,
            body: extend({}, {version: 9}, base_req)
        }).then(function (response) {
            // console.log(path, response)
            var action = [],
                musicList = [],
                touchList = [];
            // for (var i = 0; i < score; i++) {
            //     action.push([0.752, 1.32, false])
            //     musicList.push(false)
            //     touchList.push([185, 451])
            // }
            var data = {
                score: score,
                times: times,
                game_data: JSON.stringify({
                    seed: Date.now(),
                    action: action,
                    musicList: musicList,
                    touchList: touchList,
                    version: 1
                })
            };
            path = 'wxagame_settlement';
            request({
                method: 'POST',
                url: base_site + path,
                headers: headers,
                json: true,
                body: extend({}, {action_data: encrypt(data, session_id)}, base_req)
            }).then(function (response) {
                // console.log(path, response)
                console.log('2018! Happy new year! 🎉');
            }).catch(function (error) {
                console.log(error);
            });
        });
    }).catch(function (error) {
        console.log('something crash');
    });*/
})();
