import os, sqlite3, time, secrets, hashlib, hmac, base64, json, re, socket, ipaddress
from urllib.parse import urlsplit
from html.parser import HTMLParser
import requests
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware

DB=os.environ.get('FDOS_DATABASE','/data/fdos.sqlite3')
SECURE=os.environ.get('FDOS_SECURE_COOKIE','1')=='1'
ALLOWED=[x.strip() for x in os.environ.get('FDOS_ALLOWED_ORIGINS','').split(',') if x.strip()]
app=FastAPI(title='Founder Dynasty OS',version='8.0.0')
if ALLOWED: app.add_middleware(CORSMiddleware,allow_origins=ALLOWED,allow_methods=['GET','POST'],allow_headers=['Content-Type'],allow_credentials=False)

SCHEMA='''
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS projects(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,name TEXT NOT NULL,stage TEXT DEFAULT '',website_url TEXT DEFAULT '',facebook_url TEXT DEFAULT '',business_idea TEXT DEFAULT '',primary_goal TEXT DEFAULT '',biggest_constraint TEXT DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS evidence(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,claim_type TEXT NOT NULL,claim TEXT NOT NULL,source_url TEXT DEFAULT '',confidence INTEGER DEFAULT 50,limitations TEXT DEFAULT '',captured_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS diagnostics(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,total INTEGER NOT NULL,scores_json TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS decisions(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,decision TEXT NOT NULL,rationale TEXT DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sprints(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,title TEXT NOT NULL,objective TEXT NOT NULL,status TEXT DEFAULT 'active',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS kpis(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,name TEXT NOT NULL,unit TEXT DEFAULT '',direction TEXT DEFAULT 'up');
CREATE TABLE IF NOT EXISTS measurements(id INTEGER PRIMARY KEY,kpi_id INTEGER NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,value REAL NOT NULL,note TEXT DEFAULT '',measured_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,project_id INTEGER,user_id INTEGER,experiment_key TEXT DEFAULT '',variant TEXT DEFAULT '',event_name TEXT NOT NULL,label TEXT DEFAULT '',path TEXT DEFAULT '',href TEXT DEFAULT '',anonymous_id TEXT DEFAULT '',payload_json TEXT DEFAULT '{}',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sources(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,source_type TEXT NOT NULL,source_url TEXT NOT NULL,title TEXT DEFAULT '',summary TEXT DEFAULT '',signals_json TEXT DEFAULT '{}',status TEXT NOT NULL,captured_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,user_id INTEGER,action TEXT NOT NULL,resource TEXT DEFAULT '',details TEXT DEFAULT '{}',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
'''
def conn():
 os.makedirs(os.path.dirname(DB) or '.',exist_ok=True); c=sqlite3.connect(DB); c.row_factory=sqlite3.Row;c.execute('PRAGMA foreign_keys=ON');return c
def q1(sql,p=()):
 with conn() as c:return c.execute(sql,p).fetchone()
def qa(sql,p=()):
 with conn() as c:return c.execute(sql,p).fetchall()
def ex(sql,p=()):
 with conn() as c:r=c.execute(sql,p);c.commit();return r.lastrowid
with conn() as c:c.executescript(SCHEMA)

def hpw(p):
 salt=secrets.token_bytes(16); it=260000; dk=hashlib.pbkdf2_hmac('sha256',p.encode(),salt,it);return f'pbkdf2_sha256${it}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(dk).decode()}'
def vpw(p,e):
 try:
  _,it,s,h=e.split('$');got=hashlib.pbkdf2_hmac('sha256',p.encode(),base64.urlsafe_b64decode(s),int(it));return hmac.compare_digest(got,base64.urlsafe_b64decode(h))
 except:return False
def user(req):
 t=req.cookies.get('fdos_session'); r=q1('SELECT u.*,s.csrf,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?',(t,)) if t else None
 return r if r and r['expires_at']>int(time.time()) else None
def need(req):
 u=user(req)
 if not u:raise HTTPException(401,'Login required')
 return u
def own(uid,pid):
 p=q1('SELECT * FROM projects WHERE id=? AND user_id=?',(pid,uid))
 if not p:raise HTTPException(404)
 return p
def csrf(u,x):
 if not x or not hmac.compare_digest(u['csrf'],x):raise HTTPException(403,'Bad CSRF')
def log(uid,a,r='',d=None):ex('INSERT INTO audit(user_id,action,resource,details) VALUES(?,?,?,?)',(uid,a,r,json.dumps(d or {})))

CLAIMS=['Verified fact','Current external evidence','Customer-derived evidence','Internal observation','Strategic hypothesis','Financial model assumption','Forecast','Illustrative example']
DIMS=['clarity','offer','customer_evidence','acquisition','conversion','retention','pricing_margin','finance','operations','automation','trust','moat']
LABELS={'clarity':'Business clarity','offer':'Offer strength','customer_evidence':'Customer evidence','acquisition':'Acquisition','conversion':'Conversion readiness','retention':'Retention','pricing_margin':'Pricing & margin','finance':'Financial readiness','operations':'Operations','automation':'Automation','trust':'Trust & proof','moat':'Defensibility'}
ACTIONS={'clarity':'Name the customer, problem, outcome and delivery mechanism in one sentence.','offer':'Define the smallest paid offer with scope, deliverable, turnaround and price logic.','customer_evidence':'Collect direct customer evidence before treating demand as proven.','acquisition':'Pick one primary acquisition channel and a measurable weekly activity target.','conversion':'Make the next action obvious and instrument every primary CTA.','retention':'Define the recurring useful result that makes a customer return.','pricing_margin':'Document price, variable cost, fulfillment time and contribution margin.','finance':'Track cash-in, cash-out, conversion and contribution margin as named KPIs.','operations':'Document fulfillment from payment to delivery and every handoff.','automation':'Automate stable repeatable steps while keeping exceptions visible.','trust':'Add verifiable proof, transparent evidence labels and fulfillment expectations.','moat':'Build a compounding asset: data, workflow, brand, community, integration or licensing.'}
def hits(t,ws):return sum(1 for w in ws if w in (t or '').lower())
def diagnose(p,pid):
 text=' '.join([p['business_idea'],p['primary_goal'],p['biggest_constraint']]);ev=q1('SELECT COUNT(*) n FROM evidence WHERE project_id=?',(pid,))['n'];src=q1("SELECT COUNT(*) n FROM sources WHERE project_id=? AND status='ok'",(pid,))['n'];kp=q1('SELECT COUNT(*) n FROM kpis WHERE project_id=?',(pid,))['n'];dc=q1('SELECT COUNT(*) n FROM decisions WHERE project_id=?',(pid,))['n']
 s={};s['clarity']=min(100,25+min(len(p['business_idea'])//8,45)+(15 if p['primary_goal'] else 0));s['offer']=min(100,20+12*hits(text,['customer','service','product','offer','price','deliver','result']));s['customer_evidence']=min(100,10+ev*12+src*8);s['acquisition']=min(100,15+(15 if p['website_url'] else 0)+(10 if p['facebook_url'] else 0)+12*hits(text,['lead','traffic','seo','email','social','sales']));s['conversion']=min(100,15+12*hits(text,['checkout','cta','buy','book','contact','signup','payment']));s['retention']=min(100,10+14*hits(text,['repeat','renew','retention','membership','subscription','follow-up']));s['pricing_margin']=min(100,10+15*hits(text,['price','pricing','margin','cost','profit','revenue']));s['finance']=min(100,10+10*kp+12*hits(text,['budget','cash','expense','revenue','profit']));s['operations']=min(100,15+10*dc+12*hits(text,['process','workflow','fulfill','support','inventory']));s['automation']=min(100,10+14*hits(text,['automation','automate','api','integration','workflow','ai']));s['trust']=min(100,10+ev*10+src*7+12*hits(text,['proof','review','testimonial','evidence','case study']));s['moat']=min(100,10+13*hits(text,['license','data','network','community','switching','proprietary','brand','partnership']));return round(sum(s.values())/len(s)),s

def safe_url(url):
 p=urlsplit(url.strip())
 if p.scheme not in ('http','https') or not p.hostname:raise ValueError('Only public http/https URLs are supported.')
 for info in socket.getaddrinfo(p.hostname,p.port or (443 if p.scheme=='https' else 80),type=socket.SOCK_STREAM):
  ip=ipaddress.ip_address(info[4][0])
  if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:raise ValueError('Private/reserved destinations blocked.')
 return p.geturl()
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.title='';self.it=False;self.text=[]
 def handle_starttag(self,t,a):self.it=t=='title'
 def handle_endtag(self,t):
  if t=='title':self.it=False
 def handle_data(self,d):
  x=' '.join(d.split());self.text.append(x) if x else None;self.title+=((' ' if self.title else '')+x) if self.it and x else ''
def fetch(url):
 u=safe_url(url);r=requests.get(u,timeout=8,headers={'User-Agent':'FounderDynastyOS/8.0'},allow_redirects=True);r.raise_for_status();final=safe_url(r.url);p=Parser();p.feed(r.text[:1500000]);txt=' '.join(p.text);return {'status':'ok','url':final,'title':p.title[:240],'summary':txt[:900],'signals':{'cta_terms':[w for w in ['buy','shop','book','contact','subscribe','start','checkout'] if w in txt.lower()]}}
def facebook(url):
 if 'facebook.com' not in (urlsplit(url).hostname or ''):return {'status':'not_facebook','url':url,'title':'','summary':'Not a Facebook URL','signals':{}}
 try:
  o=fetch(url)
  if o['title'].lower() not in ('facebook','log into facebook'):return o
 except Exception:pass
 if not os.environ.get('META_GRAPH_ACCESS_TOKEN'):return {'status':'authorization_required','url':url,'title':'','summary':'Protected Facebook Page data was not bypassed; configure authorized Meta Graph API access.','signals':{'access_mode':'none'}}
 return {'status':'authorization_required','url':url,'title':'','summary':'Meta token exists, but object permissions must be authorized for this Page before retrieval.','signals':{'access_mode':'authorized_adapter'}}

CSS='''<style>:root{--b:#06101f;--p:#0d1c35;--l:#2b4774;--t:#eff8ff;--m:#9fb6d3;--c:#36dbff;--g:#45e5a0;--y:#ffca62}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 10% 0,#0b2944,#06101f 35%);color:var(--t);font-family:Inter,system-ui}main{max-width:1180px;margin:auto;padding:25px 18px 60px}a{color:var(--c)}.top,.actions{display:flex;gap:9px;align-items:center;justify-content:space-between;flex-wrap:wrap}.ey{color:var(--c);font-size:11px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}h1{font-size:clamp(34px,5vw,58px);letter-spacing:-.04em;margin:8px 0}.sub{color:var(--m);line-height:1.5}.grid{display:grid;gap:14px}.two{grid-template-columns:1fr 1fr}.three{grid-template-columns:repeat(3,1fr)}.card{border:1px solid var(--l);border-radius:17px;padding:17px;background:linear-gradient(180deg,#102440,var(--p));margin:10px 0}.btn{border:0;border-radius:10px;padding:10px 13px;background:linear-gradient(135deg,#6485ff,#a36cff);color:white;text-decoration:none;font-weight:900;cursor:pointer}.gold{background:linear-gradient(135deg,var(--y),#ff965a);color:#16203a}input,textarea,select{width:100%;padding:10px;border-radius:9px;border:1px solid var(--l);background:#07162c;color:white;margin:5px 0 10px}textarea{min-height:85px}.tag{display:inline-block;border:1px solid var(--l);border-radius:99px;padding:4px 7px;font-size:10px}.score{display:grid;grid-template-columns:170px 1fr 45px;gap:8px}.bar{height:8px;background:#173151;border-radius:9px;overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,#6485ff,var(--c),var(--g))}.notice{border-left:3px solid var(--y);padding:10px;background:#30270d55;border-radius:8px}@media(max-width:800px){.two,.three{grid-template-columns:1fr}.score{grid-template-columns:1fr}}</style>'''
def page(body,u=None,csrfv=''):
 nav=f'<div class="actions"><a class="btn" href="/">Command</a><a class="btn" href="/account/export">Export</a><form method="post" action="/logout"><input type="hidden" name="csrf" value="{csrfv}"><button class="btn">Logout</button></form></div>' if u else ''
 return HTMLResponse('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Founder Dynasty OS</title>'+CSS+'</head><body><main><div class="top"><div><b>Founder Dynasty OS</b><div class="ey">Business Outcome Operating System</div></div>'+nav+'</div>'+body+'</main></body></html>')
@app.get('/health')
def health():return {'ok':True,'version':'8.0.0','database':DB}
@app.get('/')
def home(request:Request):
 u=user(request)
 if not u:return page('<div class="ey">SmartPickShop Holdings × Founder Dynasty OS</div><h1>Turn a business idea into a measurable operating system.</h1><p class="sub">Website, Facebook presence, or idea only → Diagnose → Score → Prioritize → Value Sprint → Measure → Compound.</p><div class="actions"><a class="btn gold" href="/register">Create account</a><a class="btn" href="/login">Login</a></div>')
 ps=qa('SELECT * FROM projects WHERE user_id=? ORDER BY updated_at DESC',(u['id'],));cards=''.join(f'<div class="card"><a href="/projects/{p["id"]}"><h3>{p["name"]}</h3></a><div class="sub">{p["stage"]} · {p["primary_goal"]}</div></div>' for p in ps) or '<div class="notice">No projects yet.</div>'
 form=f'''<form method="post" action="/projects"><input type="hidden" name="csrf" value="{u['csrf']}"><label>Name<input name="name" required></label><label>Stage<select name="stage"><option>Idea</option><option>Pre-launch</option><option>Operating</option><option>Growing</option></select></label><label>Website URL<input name="website_url"></label><label>Facebook URL<input name="facebook_url"></label><label>Business idea<textarea name="business_idea"></textarea></label><label>Primary goal<input name="primary_goal"></label><label>Biggest constraint<input name="biggest_constraint"></label><button class="btn gold">Save project</button></form>'''
 return page(f'<h1>Founder Command Center</h1><div class="grid two"><div class="card"><h2>Start a project</h2>{form}</div><div><h2>Projects</h2>{cards}</div></div>',u,u['csrf'])
@app.get('/register')
def reg():return page('<div class="card"><h1>Create account</h1><form method="post"><input name="email" type="email" required><input name="password" type="password" minlength="10" required><button class="btn gold">Register</button></form></div>')
@app.post('/register')
def regp(email:str=Form(...),password:str=Form(...)):
 if '@' not in email or len(password)<10:raise HTTPException(400,'Invalid credentials')
 try:uid=ex('INSERT INTO users(email,password_hash) VALUES(?,?)',(email.lower().strip(),hpw(password)))
 except:raise HTTPException(400,'Email already registered')
 t,c=secrets.token_urlsafe(32),secrets.token_urlsafe(24);ex('INSERT INTO sessions(token,user_id,csrf,expires_at) VALUES(?,?,?,?)',(t,uid,c,int(time.time())+1209600));r=RedirectResponse('/',303);r.set_cookie('fdos_session',t,httponly=True,samesite='lax',secure=SECURE,max_age=1209600);return r
@app.get('/login')
def login():return page('<div class="card"><h1>Login</h1><form method="post"><input name="email" type="email" required><input name="password" type="password" required><button class="btn">Login</button></form></div>')
@app.post('/login')
def loginp(email:str=Form(...),password:str=Form(...)):
 u=q1('SELECT * FROM users WHERE email=?',(email.lower().strip(),));
 if not u or not vpw(password,u['password_hash']):raise HTTPException(400,'Invalid login')
 t,c=secrets.token_urlsafe(32),secrets.token_urlsafe(24);ex('INSERT INTO sessions(token,user_id,csrf,expires_at) VALUES(?,?,?,?)',(t,u['id'],c,int(time.time())+1209600));r=RedirectResponse('/',303);r.set_cookie('fdos_session',t,httponly=True,samesite='lax',secure=SECURE,max_age=1209600);return r
@app.post('/logout')
def logout(request:Request,csrf_token:str=Form(alias='csrf')):
 u=need(request);csrf(u,csrf_token);ex('DELETE FROM sessions WHERE token=?',(request.cookies.get('fdos_session'),));r=RedirectResponse('/',303);r.delete_cookie('fdos_session');return r
@app.post('/projects')
def create_project(request:Request,csrf_token:str=Form(alias='csrf'),name:str=Form(...),stage:str=Form(''),website_url:str=Form(''),facebook_url:str=Form(''),business_idea:str=Form(''),primary_goal:str=Form(''),biggest_constraint:str=Form('')):
 u=need(request);csrf(u,csrf_token);pid=ex('INSERT INTO projects(user_id,name,stage,website_url,facebook_url,business_idea,primary_goal,biggest_constraint) VALUES(?,?,?,?,?,?,?,?)',(u['id'],name,stage,website_url,facebook_url,business_idea,primary_goal,biggest_constraint));log(u['id'],'create','project',{'id':pid});return RedirectResponse(f'/projects/{pid}',303)
@app.get('/projects/{pid}')
def project(request:Request,pid:int):
 u=need(request);p=own(u['id'],pid);d=q1('SELECT * FROM diagnostics WHERE project_id=? ORDER BY id DESC LIMIT 1',(pid,));scores=json.loads(d['scores_json']) if d else {};ev=qa('SELECT * FROM evidence WHERE project_id=? ORDER BY id DESC',(pid,));src=qa('SELECT * FROM sources WHERE project_id=? ORDER BY id DESC',(pid,));decs=qa('SELECT * FROM decisions WHERE project_id=? ORDER BY id DESC',(pid,));kpis=qa('SELECT * FROM kpis WHERE project_id=?',(pid,));sprints=qa('SELECT * FROM sprints WHERE project_id=? ORDER BY id DESC',(pid,));scorehtml=''.join(f'<div class="score"><b>{LABELS[k]}</b><div class="bar"><i style="width:{scores.get(k,0)}%"></i></div><b>{scores.get(k,0)}</b></div>' for k in DIMS) if d else '<div class="notice">Run a diagnosis.</div>';leaks=sorted(((100-scores.get(k,0),k) for k in DIMS),reverse=True)[:6] if d else [];leakhtml=''.join(f'<div class="card"><span class="tag">Severity {sev}</span><b> {LABELS[k]}</b><p>{ACTIONS[k]}</p></div>' for sev,k in leaks)
 evhtml=''.join(f'<div class="card"><span class="tag">{e["claim_type"]}</span><b>{e["claim"]}</b><p class="sub">Confidence {e["confidence"]}% · {e["limitations"]}</p></div>' for e in ev) or '<p class="sub">No evidence yet.</p>';srchtml=''.join(f'<div class="card"><span class="tag">{s["status"]}</span><b>{s["source_type"]}: {s["title"]}</b><p class="sub">{s["summary"]}</p></div>' for s in src) or '<p class="sub">No analyzed sources.</p>';kphtml=''.join(f'<div class="card"><b>{k["name"]}</b><form method="post" action="/kpis/{k["id"]}/measure"><input type="hidden" name="csrf" value="{u["csrf"]}"><input name="value" type="number" step="any" required><input name="note" placeholder="note"><button class="btn">Measure</button></form></div>' for k in kpis);dechtml=''.join(f'<div class="card"><b>{x["decision"]}</b><p class="sub">{x["rationale"]}</p></div>' for x in decs);sphtml=''.join(f'<div class="card"><span class="tag">{x["status"]}</span><b>{x["title"]}</b><p class="sub">{x["objective"]}</p></div>' for x in sprints)
 body=f'''<div class="ey">{p['stage']} · Project #{pid}</div><h1>{p['name']}</h1><div class="grid three"><div class="card"><b>Website</b><p>{p['website_url'] or 'Not supplied'}</p></div><div class="card"><b>Facebook</b><p>{p['facebook_url'] or 'Not supplied'}</p></div><div class="card"><b>Goal</b><p>{p['primary_goal']}</p></div></div><h2>Dynasty Score {d['total'] if d else ''}</h2><div class="card">{scorehtml}<form method="post" action="/projects/{pid}/diagnose"><input type="hidden" name="csrf" value="{u['csrf']}"><button class="btn gold">Run diagnosis</button></form></div><h2>Value Leaks</h2>{leakhtml}<h2>Source Analysis</h2><div class="grid two"><div class="card"><form method="post" action="/projects/{pid}/analyze"><input type="hidden" name="csrf" value="{u['csrf']}"><select name="source_type"><option value="website">Website</option><option value="facebook">Facebook</option></select><input name="url" required placeholder="https://..."><button class="btn">Analyze public source</button></form></div><div>{srchtml}</div></div><h2>Evidence Ledger</h2><div class="grid two"><div class="card"><form method="post" action="/projects/{pid}/evidence"><input type="hidden" name="csrf" value="{u['csrf']}"><select name="claim_type">{''.join(f'<option>{x}</option>' for x in CLAIMS)}</select><textarea name="claim" required></textarea><input name="source_url" placeholder="source URL"><input name="confidence" type="number" min="0" max="100" value="50"><textarea name="limitations" placeholder="limitations"></textarea><button class="btn">Add evidence</button></form></div><div>{evhtml}</div></div><h2>AI Council</h2><div class="card"><p>Strategy · Customer · Growth · Finance · Operations · Evidence Integrity</p><p class="sub">Council synthesis uses the same stored project state and never upgrades hypotheses into facts.</p><form method="post" action="/projects/{pid}/council"><input type="hidden" name="csrf" value="{u['csrf']}"><button class="btn">Generate Council decision</button></form></div><h2>Value Sprints</h2><div class="grid two"><div class="card"><form method="post" action="/projects/{pid}/sprint"><input type="hidden" name="csrf" value="{u['csrf']}"><input name="title" required placeholder="Sprint title"><textarea name="objective" required placeholder="Measurable objective"></textarea><button class="btn">Create sprint</button></form></div><div>{sphtml}</div></div><h2>KPIs</h2><div class="grid two"><div class="card"><form method="post" action="/projects/{pid}/kpi"><input type="hidden" name="csrf" value="{u['csrf']}"><input name="name" required placeholder="KPI"><input name="unit" placeholder="unit"><button class="btn">Add KPI</button></form></div><div>{kphtml}</div></div><h2>Dynasty Vault</h2><div class="grid two"><div class="card"><form method="post" action="/projects/{pid}/decision"><input type="hidden" name="csrf" value="{u['csrf']}"><textarea name="decision" required placeholder="Decision"></textarea><textarea name="rationale" placeholder="Rationale"></textarea><button class="btn">Save decision</button></form></div><div>{dechtml}</div></div><a class="btn" href="/projects/{pid}/export">Export project JSON</a>'''
 return page(body,u,u['csrf'])
@app.post('/projects/{pid}/diagnose')
def diag(request:Request,pid:int,csrf_token:str=Form(alias='csrf')):
 u=need(request);csrf(u,csrf_token);p=own(u['id'],pid);total,s=diagnose(p,pid);ex('INSERT INTO diagnostics(project_id,total,scores_json) VALUES(?,?,?)',(pid,total,json.dumps(s)));log(u['id'],'diagnose','project',{'id':pid,'score':total});return RedirectResponse(f'/projects/{pid}',303)
@app.post('/projects/{pid}/evidence')
def evidence(request:Request,pid:int,csrf_token:str=Form(alias='csrf'),claim_type:str=Form(...),claim:str=Form(...),source_url:str=Form(''),confidence:int=Form(50),limitations:str=Form('')):
 u=need(request);csrf(u,csrf_token);own(u['id'],pid)
 if claim_type not in CLAIMS:raise HTTPException(400)
 ex('INSERT INTO evidence(project_id,claim_type,claim,source_url,confidence,limitations) VALUES(?,?,?,?,?,?)',(pid,claim_type,claim,source_url,max(0,min(100,confidence)),limitations));return RedirectResponse(f'/projects/{pid}',303)
@app.post('/projects/{pid}/analyze')
def analyze(request:Request,pid:int,csrf_token:str=Form(alias='csrf'),source_type:str=Form(...),url:str=Form(...)):
 u=need(request);csrf(u,csrf_token);own(u['id'],pid)
 try:o=facebook(url) if source_type=='facebook' else fetch(url)
 except Exception as e:o={'status':'error','url':url,'title':'','summary':str(e),'signals':{}}
 ex('INSERT INTO sources(project_id,source_type,source_url,title,summary,signals_json,status) VALUES(?,?,?,?,?,?,?)',(pid,source_type,o.get('url',url),o.get('title',''),o.get('summary',''),json.dumps(o.get('signals',{})),o.get('status','error')))
 if o.get('status')=='ok':ex('INSERT INTO evidence(project_id,claim_type,claim,source_url,confidence,limitations) VALUES(?,?,?,?,?,?)',(pid,'Current external evidence','Public source captured: '+(o.get('title') or o.get('url')),o.get('url',url),80,'Automated public-page extraction; validate context before strategic use.'))
 return RedirectResponse(f'/projects/{pid}',303)
@app.post('/projects/{pid}/council')
def council(request:Request,pid:int,csrf_token:str=Form(alias='csrf')):
 u=need(request);csrf(u,csrf_token);p=own(u['id'],pid);total,s=diagnose(p,pid);low=sorted(s,key=s.get)[:3];decision='Council priority: '+', '.join(LABELS[x] for x in low)+'. Start with '+ACTIONS[low[0]];ex('INSERT INTO decisions(project_id,decision,rationale) VALUES(?,?,?)',(pid,decision,'Synthesis of Strategy, Customer, Growth, Finance, Operations and Evidence Integrity roles using stored founder inputs and evidence.'));return RedirectResponse(f'/projects/{pid}',303)
@app.post('/projects/{pid}/decision')
def decision(request:Request,pid:int,csrf_token:str=Form(alias='csrf'),decision:str=Form(...),rationale:str=Form('')):
 u=need(request);csrf(u,csrf_token);own(u['id'],pid);ex('INSERT INTO decisions(project_id,decision,rationale) VALUES(?,?,?)',(pid,decision,rationale));return RedirectResponse(f'/projects/{pid}',303)
@app.post('/projects/{pid}/sprint')
def sprint(request:Request,pid:int,csrf_token:str=Form(alias='csrf'),title:str=Form(...),objective:str=Form(...)):
 u=need(request);csrf(u,csrf_token);own(u['id'],pid);ex('INSERT INTO sprints(project_id,title,objective) VALUES(?,?,?)',(pid,title,objective));return RedirectResponse(f'/projects/{pid}',303)
@app.post('/projects/{pid}/kpi')
def kpi(request:Request,pid:int,csrf_token:str=Form(alias='csrf'),name:str=Form(...),unit:str=Form('')):
 u=need(request);csrf(u,csrf_token);own(u['id'],pid);ex('INSERT INTO kpis(project_id,name,unit) VALUES(?,?,?)',(pid,name,unit));return RedirectResponse(f'/projects/{pid}',303)
@app.post('/kpis/{kid}/measure')
def measure(request:Request,kid:int,csrf_token:str=Form(alias='csrf'),value:float=Form(...),note:str=Form('')):
 u=need(request);csrf(u,csrf_token);k=q1('SELECT k.*,p.user_id,p.id pid FROM kpis k JOIN projects p ON p.id=k.project_id WHERE k.id=?',(kid,));
 if not k or k['user_id']!=u['id']:raise HTTPException(404)
 ex('INSERT INTO measurements(kpi_id,value,note) VALUES(?,?,?)',(kid,value,note));return RedirectResponse(f'/projects/{k["pid"]}',303)
@app.post('/api/events')
async def event(request:Request):
 if ALLOWED and request.headers.get('origin','') not in ALLOWED:raise HTTPException(403,'Origin not allowed')
 p=await request.json();name=str(p.get('event_name') or p.get('name') or '')[:100]
 if not name:raise HTTPException(400,'event_name required')
 u=user(request);eid=ex('INSERT INTO events(project_id,user_id,experiment_key,variant,event_name,label,path,href,anonymous_id,payload_json) VALUES(?,?,?,?,?,?,?,?,?,?)',(p.get('project_id'),u['id'] if u else None,str(p.get('experiment_key',''))[:80],str(p.get('variant',''))[:20],name,str(p.get('label',''))[:200],str(p.get('path',''))[:500],str(p.get('href',''))[:800],str(p.get('anonymous_id',''))[:100],json.dumps(p)[:10000]));return {'ok':True,'event_id':eid}
@app.get('/api/experiments/shopify_buyer_router_v1/variant')
def expv(request:Request):
 aid=request.cookies.get('fdos_anon') or secrets.token_urlsafe(12);v='A' if int(hashlib.sha256(aid.encode()).hexdigest(),16)%2==0 else 'B';r=JSONResponse({'experiment_key':'shopify_buyer_router_v1','variant':v,'status':'ready','baseline':{'sessions':161,'cart_add_sessions':0,'checkouts':0,'orders':0}});r.set_cookie('fdos_anon',aid,max_age=31536000,samesite='lax',secure=SECURE);return r
@app.get('/projects/{pid}/export')
def pexport(request:Request,pid:int):
 u=need(request);p=own(u['id'],pid);d={'project':dict(p)}
 for t in ['evidence','diagnostics','decisions','sprints','kpis','events','sources']:d[t]=[dict(x) for x in qa(f'SELECT * FROM {t} WHERE project_id=?',(pid,))]
 return JSONResponse(d,headers={'Content-Disposition':f'attachment; filename="fdos-project-{pid}.json"'})
@app.get('/account/export')
def aexport(request:Request):
 u=need(request);return JSONResponse({'user':{'id':u['id'],'email':u['email'],'created_at':u['created_at']},'projects':[dict(x) for x in qa('SELECT * FROM projects WHERE user_id=?',(u['id'],))]})
