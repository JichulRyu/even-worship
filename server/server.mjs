import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {timingSafeEqual} from 'node:crypto';
const catalog=JSON.parse(await readFile(new URL('../scores.json',import.meta.url),'utf8')).songs;
const {TAVILY_API_KEY,GROQ_API_KEY,EW_INVITE_TOKEN}=process.env;
if(!EW_INVITE_TOKEN||EW_INVITE_TOKEN.length<24)throw Error('Set EW_INVITE_TOKEN (at least 24 characters)');
const origins=new Set((process.env.EW_ORIGINS||'https://jichulryu.github.io').split(',').map(x=>x.trim()));
const limit=Number(process.env.EW_DAILY_LIMIT||100);if(!Number.isInteger(limit)||limit<1||limit>1000)throw Error('Invalid EW_DAILY_LIMIT');
let day='',used=0,active=0;const norm=s=>String(s).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function authorized(req){const given=Buffer.from(req.headers.authorization||''),expected=Buffer.from('Bearer '+EW_INVITE_TOKEN);return given.length===expected.length&&timingSafeEqual(given,expected)}
async function body(req,max){let size=0,parts=[];for await(const part of req){size+=part.length;if(size>max)throw Object.assign(Error('Request too large'),{status:413});parts.push(part)}return Buffer.concat(parts)}
function count(){const today=new Date().toISOString().slice(0,10);if(day!==today){day=today;used=0}if(used>=limit||active>=4)throw Object.assign(Error('Service limit reached'),{status:429});used++;active++}
async function upstream(url,opts){const r=await fetch(url,{...opts,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Object.assign(Error('Upstream request failed: '+r.status),{status:r.status===429?429:502});return r.json()}
createServer(async(req,res)=>{
 const origin=req.headers.origin;
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
 if(origin&&origins.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='POST, OPTIONS';headers['Access-Control-Allow-Headers']='authorization, content-type'}
 const send=(status,data)=>{res.writeHead(status,headers);res.end(JSON.stringify(data))};
 if(origin&&!origins.has(origin))return send(403,{error:'Origin not allowed'});
 if(req.method==='OPTIONS'){res.writeHead(204,headers);return res.end()}
 if(req.method!=='POST'||!['/search','/transcribe'].includes(req.url))return send(404,{error:'Not found'});
 if(!authorized(req))return send(401,{error:'Invitation token required'});
 let counted=false;try{
 if(req.url==='/search'){
 const data=JSON.parse((await body(req,4096)).toString('utf8'));
 const q=typeof data.title==='string'?data.title.trim():'',key=typeof data.key==='string'&&/^[A-G][#b]?$/.test(data.key)?data.key:'';
 if(!q||q.length>150)return send(400,{error:'Invalid title'});
 const songs=catalog.filter(s=>s.access==='free'&&s.reuseAllowed===true&&s.license&&norm(s.title)===norm(q));
 if(songs.length||!TAVILY_API_KEY)return send(200,{songs,results:[]});
 count();counted=true;
 const result=await upstream('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+TAVILY_API_KEY},body:JSON.stringify({query:'"'+q.replaceAll('"','')+'" '+key+' 찬양 기타 코드 악보 블로그',search_depth:'basic',max_results:10,exclude_domains:['tavily.com','github.com','youtube.com','facebook.com','instagram.com','chordscore.com','akbotong.com','soundleader.co.kr','songselect.ccli.com','mapianist.com','fullscore.co.kr','akbostreet.com'],include_raw_content:false,include_answer:false})});
 return send(200,{songs:[],results:(result.results||[]).map(x=>({title:String(x.title||'').slice(0,250),url:String(x.url||'').slice(0,2000),content:String(x.content||'').slice(0,1000),score:Number(x.score)||0}))});
 }
 if(!GROQ_API_KEY)return send(503,{error:'Speech service not configured'});
 const audio=await body(req,300000);
 if(audio.length<44||audio.subarray(0,4).toString()!=='RIFF'||audio.subarray(8,12).toString()!=='WAVE')return send(400,{error:'Invalid WAV'});
 count();counted=true;
 const form=new FormData();form.append('file',new Blob([audio],{type:'audio/wav'}),'title.wav');form.append('model','whisper-large-v3-turbo');form.append('language','ko');
 const result=await upstream('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+GROQ_API_KEY},body:form});
 return send(200,{text:String(result.text||'').slice(0,150)});
 }catch(e){return send(e.status||400,{error:e.status?e.message:'Invalid request or service unavailable'})}finally{if(counted)active--}
}).listen(Number(process.env.PORT||8787),'0.0.0.0',()=>console.log('Even Worship test service started'));
