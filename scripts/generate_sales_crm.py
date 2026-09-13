from pathlib import Path
import json
import xlsxwriter

ROOT = Path(__file__).resolve().parents[1]
LEADS = ROOT / 'sales-engine-app/data/leads.json'
SCRIPTS = ROOT / 'sales-engine-app/data/scripts.json'
HISTORY = ROOT / 'sales-engine/pipeline-history.json'
OUT = ROOT / 'sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx'

lead_data = json.loads(LEADS.read_text(encoding='utf-8'))
script_data = json.loads(SCRIPTS.read_text(encoding='utf-8')) if SCRIPTS.exists() else {'scripts': []}
history_data = json.loads(HISTORY.read_text(encoding='utf-8')) if HISTORY.exists() else {'records': {}}
leads = lead_data.get('leads', [])
history = history_data.get('records', {})
lead_map = {l.get('business'): l for l in leads}

OUT.parent.mkdir(parents=True, exist_ok=True)
wb = xlsxwriter.Workbook(OUT)
wb.set_properties({'title':'Same-Day Customer Growth Pack — Live CRM','subject':'Verified prospecting CRM','author':'Founder OS'})

hdr = wb.add_format({'bold':True,'font_color':'white','bg_color':'#1F4E78','border':1,'valign':'top','text_wrap':True})
subhdr = wb.add_format({'bold':True,'font_color':'white','bg_color':'#475569','border':1,'text_wrap':True})
cell = wb.add_format({'text_wrap':True,'valign':'top','border':1,'border_color':'#D9E2F3'})
money = wb.add_format({'num_format':'$#,##0','border':1,'border_color':'#D9E2F3','valign':'top'})
pct = wb.add_format({'num_format':'0.0%','border':1,'border_color':'#D9E2F3'})
title = wb.add_format({'bold':True,'font_color':'white','bg_color':'#111827','font_size':16,'align':'center','valign':'vcenter'})
green = wb.add_format({'bg_color':'#DCFCE7','font_color':'#166534','bold':True,'border':1})
red = wb.add_format({'bg_color':'#FEE2E2','font_color':'#991B1B','border':1})

# Fresh verified lead queue
ws = wb.add_worksheet('New Lead Queue')
headers = ['Rank','Business','Category','City','Tier','Verified Opportunity','Phone','Email','Reachability','Angle','Subject','Individualized Initial Pitch','Source URL','Verified','Status']
for c,h in enumerate(headers): ws.write(0,c,h,hdr)
for r,l in enumerate(leads,1):
    rec = history.get(l.get('business'), {})
    vals=[l.get('rank'),l.get('business'),l.get('category'),l.get('city'),l.get('tier'),l.get('opportunity'),l.get('phone'),l.get('email'),l.get('reachability'),l.get('angle'),l.get('subject'),l.get('initial'),l.get('source'),l.get('verified'),rec.get('stage',l.get('status','Contact Ready'))]
    for c,v in enumerate(vals): ws.write(r,c,v,cell)
ws.freeze_panes(1,0); ws.autofilter(0,0,len(leads),len(headers)-1)
for i,w in enumerate([7,32,26,22,8,54,18,34,30,48,38,72,50,14,18]): ws.set_column(i,i,w)
ws.conditional_format(1,4,max(len(leads),1),4,{'type':'text','criteria':'containing','value':'A','format':green})

# Scripts
sw = wb.add_worksheet('Scripts')
for c,h in enumerate(['Script ID','Stage','When to Use','Copy']): sw.write(0,c,h,hdr)
for r,s in enumerate(script_data.get('scripts',[]),1):
    for c,v in enumerate([s.get('id'),s.get('stage'),s.get('when'),s.get('copy')]): sw.write(r,c,v,cell)
sw.freeze_panes(1,0); sw.set_column(0,0,12); sw.set_column(1,1,24); sw.set_column(2,2,34); sw.set_column(3,3,92)

# Active pipeline = current fresh leads + any real contacted history not archived.
pw = wb.add_worksheet('Pipeline')
pheaders=['Lead','Priority','Channel','First Touch','FU1 Due','FU1 Sent','FU2 Due','FU2 Sent','Reply','Stage','Quoted $','Paid $','Fulfilled','Next Action','Opt Out','Last Verified','Source','Offer Value $']
for c,h in enumerate(pheaders): pw.write(0,c,h,hdr)
stages=['Contact Ready','Contacted','Replied','Negotiating','Won/Paid','Fulfilled','Follow-up','Lost/Not a Fit','Do Not Contact','Reverify']
active_names=[l.get('business') for l in leads]
active_names += [name for name,rec in history.items() if rec.get('stage')=='Contacted' and not rec.get('archived') and name not in lead_map]
for r,name in enumerate(active_names,1):
    l=lead_map.get(name,{})
    rec=history.get(name,{})
    channel=l.get('email') or l.get('phone') or rec.get('firstTouchChannel','')
    vals=[name,l.get('rank','Follow-up'),channel,rec.get('firstTouch',''),rec.get('fu1Due',''),rec.get('fu1Sent',''),rec.get('fu2Due',''),rec.get('fu2Sent',''),rec.get('reply',''),rec.get('stage',l.get('status','Contact Ready')),rec.get('quoted',0),rec.get('paid',0),rec.get('fulfilled',''),rec.get('nextAction',''),rec.get('optOut',''),l.get('verified',''),l.get('source',''),rec.get('offerValue',150)]
    for c,v in enumerate(vals): pw.write(r,c,v,money if c in (10,11,17) else cell)
pw.data_validation(1,9,500,9,{'validate':'list','source':stages})
pw.freeze_panes(1,0); pw.autofilter(0,0,max(len(active_names),1),len(pheaders)-1)
for i,w in enumerate([32,10,34,24,14,24,14,24,38,18,12,12,14,58,12,14,50,14]): pw.set_column(i,i,w)
pw.conditional_format(1,9,500,9,{'type':'text','criteria':'containing','value':'Won/Paid','format':green})
pw.conditional_format(1,9,500,9,{'type':'text','criteria':'containing','value':'Do Not Contact','format':red})

# Every observed outbound contact, including records rotated out of the fresh queue.
oh = wb.add_worksheet('Actual Outreach History')
oheaders=['Business','First Touch','First Touch Evidence','FU1 Sent','FU1 Evidence','FU2 Sent','FU2 Evidence','Reply','Stage','Next Action','Paid $','Fulfilled']
for c,h in enumerate(oheaders): oh.write(0,c,h,hdr)
row=1
for name,rec in sorted(history.items(), key=lambda kv: kv[1].get('firstTouch','')):
    if rec.get('firstTouch'):
        vals=[name,rec.get('firstTouch',''),rec.get('firstTouchEvidence',''),rec.get('fu1Sent',''),rec.get('fu1Evidence',''),rec.get('fu2Sent',''),rec.get('fu2Evidence',''),rec.get('reply',''),rec.get('stage',''),rec.get('nextAction',''),rec.get('paid',0),rec.get('fulfilled','')]
        for c,v in enumerate(vals): oh.write(row,c,v,money if c==10 else cell)
        row += 1
oh.freeze_panes(1,0)
for i,w in enumerate([32,24,44,24,44,24,44,36,18,66,12,14]): oh.set_column(i,i,w)

# Archived/rotated records remain visible rather than being deleted.
aw = wb.add_worksheet('Archived Leads')
aheaders=['Business','Stage','First Touch','Reply','Quoted $','Paid $','Archived','Opt Out','Next Action']
for c,h in enumerate(aheaders): aw.write(0,c,h,subhdr)
row=1
for name,rec in history.items():
    if rec.get('archived'):
        vals=[name,rec.get('stage',''),rec.get('firstTouch',''),rec.get('reply',''),rec.get('quoted',0),rec.get('paid',0),rec.get('archived',''),rec.get('optOut',''),rec.get('nextAction','')]
        for c,v in enumerate(vals): aw.write(row,c,v,money if c in (4,5) else cell)
        row+=1
aw.freeze_panes(1,0)
for i,w in enumerate([32,18,24,34,12,12,14,12,64]): aw.set_column(i,i,w)

# Sources
ss = wb.add_worksheet('Sources')
for c,h in enumerate(['Business','Verified Opportunity','Source URL','Verified Date','Direct Contact','Reverify Rule']): ss.write(0,c,h,hdr)
for r,l in enumerate(leads,1):
    vals=[l.get('business'),l.get('opportunity'),l.get('source'),l.get('verified'),l.get('email') or l.get('phone'),'Reverify time-sensitive offers, hours, financing, ETA, response-time claims, and contact details before outreach.']
    for c,v in enumerate(vals): ss.write(r,c,v,cell)
ss.freeze_panes(1,0)
for i,w in enumerate([32,62,50,14,34,58]): ss.set_column(i,i,w)

# Dashboard. Offer value is not quoted revenue.
D=wb.add_worksheet('Dashboard'); D.merge_range('A1:F1','SAME-DAY CUSTOMER GROWTH PACK — LIVE PIPELINE',title); D.set_row(0,28)
for c,h in enumerate(['Metric','Value','','Commercial Metric','Value','Meaning']): D.write(2,c,h,hdr if c!=2 else cell)
metrics=[('Contact Ready','Contact Ready'),('Contacted','Contacted'),('Replied','Replied'),('Negotiating','Negotiating'),('Won/Paid','Won/Paid'),('Fulfilled','Fulfilled')]
for i,(label,stage) in enumerate(metrics,3):
    D.write(i,0,label,cell); D.write_formula(i,1,f'=COUNTIF(Pipeline!J:J,"{stage}")',cell)
D.write(3,3,'Nominal Offer Value',cell); D.write_formula(3,4,'=SUM(Pipeline!R:R)',money); D.write(3,5,'Potential at the standard package price; not booked revenue.',cell)
D.write(4,3,'Actual Quoted $',cell); D.write_formula(4,4,'=SUM(Pipeline!K:K)',money); D.write(4,5,'Only real negotiated/quoted dollars.',cell)
D.write(5,3,'Paid Revenue',cell); D.write_formula(5,4,'=SUM(Pipeline!L:L)',money); D.write(5,5,'Only actual payments.',cell)
D.write(6,3,'Response Rate',cell); D.write_formula(6,4,'=IFERROR(COUNTIF(Pipeline!J:J,"Replied")/COUNTIF(Pipeline!D:D,"<>"),0)',pct); D.write(6,5,'Replies divided by records with a real first touch.',cell)
D.write(7,3,'Close Rate',cell); D.write_formula(7,4,'=IFERROR(COUNTIF(Pipeline!J:J,"Won/Paid")/COUNTIF(Pipeline!D:D,"<>"),0)',pct); D.write(7,5,'Wins divided by records with a real first touch.',cell)
D.set_column('A:A',22); D.set_column('B:B',14); D.set_column('C:C',4); D.set_column('D:D',24); D.set_column('E:E',16); D.set_column('F:F',48)

# Update rules
uw=wb.add_worksheet('Update Rules')
rules=[
('Canonical lead feed','sales-engine-app/data/leads.json'),
('Canonical pipeline history','sales-engine/pipeline-history.json'),
('Canonical workbook','sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx'),
('Fresh means fresh','Before a prospect enters New Lead Queue, verify it and check connected Gmail history for prior contact.'),
('Evidence','Every current lead requires a current source URL and dated evidence-based opportunity.'),
('Contacts','Never invent email, phone, person, role, offer, or contact detail.'),
('Pipeline truth','Never mark contact, reply, quote, payment, customer, revenue, or fulfillment unless it actually occurred.'),
('Offer value','The standard package price is potential value, not quoted pipeline or revenue.'),
('Follow-up','Initial cold contact + max two respectful cold follow-ups; stop sooner on decline/opt-out and avoid duplicate account touches.'),
('Claims','No guaranteed leads, ROI, rankings, bookings, response rates, or revenue.'),
('Workbook generation','GitHub Actions regenerates this XLSX from the live feed + truth-preserving pipeline history.')]
uw.write(0,0,'Rule',hdr); uw.write(0,1,'Requirement',hdr)
for r,(a,b) in enumerate(rules,1): uw.write(r,0,a,cell); uw.write(r,1,b,cell)
uw.set_column(0,0,28); uw.set_column(1,1,100)

# Refresh log
rw=wb.add_worksheet('Refresh Log'); rw.write_row(0,0,['Refresh Date','Fresh Leads','Observed Contact Records','Archived Records','Notes'],hdr)
observed=sum(1 for rec in history.values() if rec.get('firstTouch'))
rw.write_row(1,0,[lead_data.get('meta',{}).get('lastUpdated',''),len(leads),observed,sum(1 for x in history.values() if x.get('archived')),'Generated from the verified lead feed and preserved pipeline history. Unobserved outcomes remain zero/blank.'],cell)
rw.set_column(0,3,20); rw.set_column(4,4,90)

wb.close()
print(f'Generated {OUT}')
