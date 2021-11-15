
const fs         = require('fs');
const lerArquivo = require('./src/index')
const puppeteer  = require('puppeteer');
const cookies    = require('./cookies.json');
const { exit }   = require('process');
require('dotenv').config()

const user     = process.env.FB_USER
const password = process.env.FB_PASS;
var   browser  = null
var   page     = null 
const url      = 'https://business.facebook.com/creatorstudio/pre_published?content_table=SCHEDULED_POSTS'
const caminho  = process.env.POST_PATH

const arquivos = lerArquivo(caminho)
const dates    = gerarDias(15, 11, 2021, 1)
const countTime = [   
    {hora: '12',minuto: '00', meridiem: 'p'},
    {hora: '1', minuto: '00', meridiem: 'p'},
    {hora: '3', minuto: '00', meridiem: 'p'},
    {hora: '5', minuto: '00', meridiem: 'p'},
    {hora: '6', minuto: '00', meridiem: 'p'},
]

async function main(){
    browser = await puppeteer.launch({headless: false})
    page    = await browser.newPage()
    await page.setViewport({
        width:1342,
        height: 789,
        deviceScaleFactor: 1
    })

    if(Object.keys(cookies).length){
        await page.setCookie(...cookies)
        await page.goto(url, { waitUntil: 'networkidle2' })
        
        let start = 140
        for (let d in dates) {
            for (let t in countTime) {
                await agendarPost(dates[d], countTime[t], arquivos[start])
                start++
            }
        }

        await browser.close()
    
    } else {
        login()
    }

}

async function agendarPost(date, time, post){
    
    await page.waitForTimeout(1000)
    await page.click('div[id="mediaManagerFacebookComposerLeftNavButton"]')
    await page.waitForTimeout(1000)
    await page.click('div[class="uiContextualLayer uiContextualLayerBelowLeft"] > div > div > div >div')
    await page.waitForSelector('div[id="creator_studio_sliding_tray_root"] div[style="width: 540px; top: 90px;"] > div > div > div > div')
    await page.waitForTimeout(1000)
    const perfis = await page.$$('div[id="creator_studio_sliding_tray_root"] div[style="width: 540px; top: 90px;"] > div > div > div > div')
    await perfis[2].click()

    console.log(post)

    await page.waitForSelector('div[aria-label="Escreva na caixa de diálogo o texto a ser adicionado à publicação."]')
    await escolherArquivo(caminho +'/'+ post.arquivo +'/'+ 'imagem.jpg')
    await page.type('div[aria-label="Escreva na caixa de diálogo o texto a ser adicionado à publicação."]', post.texto,  { delay: 100 })
    await page.click('div[style="border-top: 1px solid transparent;"] > span:nth-child(2) > div > div > div > div > div:nth-child(2) > div')
    await page.waitForSelector('div[data-testid="ContextualLayerRoot"]  > div > div > div > div > div > div > div > div > div')
    await page.click('div[data-testid="ContextualLayerRoot"]  > div > div > div > div > div > div > div > div > div')
    
    await page.waitForSelector('div[style="min-height: 0px;"] input[placeholder="dd/mm/aaaa"]')
    const input = await page.$('div[style="min-height: 0px;"] input[placeholder="dd/mm/aaaa"]');
    await input.click({ clickCount: 3 })
    await input.type(date)
    
    const SchedulepublicationInputs = await page.$$('div[aria-label="Programar publicação"] div[role="application"] input')
    await SchedulepublicationInputs[0].type(time.hora, { delay: 100 })
    await SchedulepublicationInputs[1].type(time.minuto, { delay: 100 })
    await SchedulepublicationInputs[2].type(time.meridiem, { delay: 100 }) 
    
    const buttons = await page.$$('div[aria-label="Programar publicação"] div[role="button"]')
    await buttons[2].click()

    await page.waitForSelector('div[style="border-top: 1px solid transparent;"] > span:nth-child(2) > div > div > div > div > div')
    await page.click('div[style="border-top: 1px solid transparent;"] > span:nth-child(2) > div > div > div > div > div')
}

async function escolherArquivo(caminho){
        const imageButton = 'div[area-label="Selecione a opção de adicionar fotos."]  > div > a';
    
        const [fileChoose] = await Promise.all([
            page.waitForFileChooser(),
            page.click(imageButton)
        ])

        await fileChoose.accept([caminho])
        await page.waitForSelector('div[role="img"] > img')
        console.log('| '+ caminho)
    }

function gerarDias(dia, mes, ano,dias){
    let dateList = []
    let a = new Date(ano, mes-1, dia-1)
    for(let x=0; x < dias; x++){
        a.setDate(a.getDate() + 1)
        dateList.push(`${a.getDate()}/${a.getMonth()+1}/${a.getFullYear()}`)
    }
    return dateList
}

async function login(){
    await page.goto('https://pt-br.facebook.com/login/web/', { waitUntil: 'networkidle2' })
    await page.type('input[name="email"]', user, {delay: 100})
    await page.type('input[name="pass"]', password, {delay: 100})
    await page.click('#loginbutton')
    await page.waitForNavigation({waitUntil: 'networkidle0'})
    await page.waitForTimeout(15000)
    try{
        await page.waitForSelector('.j83agx80.l9j0dhe7.k4urcfbm')
    } catch{
        console.log('failed to login.')
        exit()
    }
    let currentCookies = await page.cookies();
    fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies))
}

main()