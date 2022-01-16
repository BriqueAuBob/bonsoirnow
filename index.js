const Twit = require('twit')
const moment = require('moment')
require('moment-timezone')
require('dotenv').config()

const { createCanvas, loadImage, registerFont } = require('canvas')
registerFont('fonts/helvetica-light.ttf', { family: 'Helvetica Light' })

const T = new Twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret
})

const stream = T.stream('statuses/filter', {track: '@BonsoirNow'});
stream.on('tweet', async function (tweet) {
    if (tweet.user.id === 1350070555567911000) return
    
    const dstr = moment(new Date()).locale("fr").tz('Europe/Paris').format("dddd Do MMMM")
    const time = moment(new Date()).locale("fr").tz('Europe/Paris').format("HH:mm")
    const canvas = createCanvas(851, 851)
    const ctx = canvas.getContext('2d')
    const image = await loadImage('img/base.png')

    ctx.drawImage(image, 0, 0, 851, 851)
    ctx.textAlign = "center"
    ctx.fillStyle = "white";
    ctx.font = "lighter 164px Helvetica Light"
    ctx.fillText(time, 851/2, 300)
    ctx.font = "48px Arial"
    ctx.fillText(dstr.charAt(0).toUpperCase() + dstr.slice(1), 851/2, 388)

    const img = await canvas.toBuffer()
    const base64 = Buffer.from(img).toString('base64')

    T.post('media/upload', { media_data: base64 }, function (err, data, response) {
        const mediaIdStr = data.media_id_string
        T.post('statuses/update', { status: `@${tweet.user.screen_name}`, media_ids: [mediaIdStr], in_reply_to_status_id: tweet.id_str }, function(err, data, response) {
            console.log(err, data)
        })
    })
})

console.log("Running bot...")
