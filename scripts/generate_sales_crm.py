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

OUT.parent.mkdir(parents=True, exist_ok=True)
wb = xlsxwriter.Workbook(OUT)
wb.set_properties({'title':'Same-Day Customer Growth Pack — Live CRM','subject':'Verified prospecting CRM','author':'Founder OS'})

hdr = wb.add_format({'bold':True,'font_color':'white','bg_color':'#1F4E78','border':1,'valign':'top'})
subhdr = wb.add_format({'bold':True,'font_color':'white','bg_color':'#475569','border':1})
cell = wb.add_format({'text_wrap':True,'valign':'top','border':1,'border_color':'#D9E2F3'})
small = wb.add_format({'text_wrap':True,'valign':'top','font_size':9,'font_color':'#475569','border':1,'border_color':'#D9E2F3'})
money = wb.add_format({'num_format':'$#,##0','border':1,'border_color':'#D9E2F3'})
pct = wb.add_format({'num_format':'0.0%','border':1,'border_color':'#D9E2F3'})
title = wb.add_format({'bold':True,'font_color':'white','bg_color':'#111827','font_size':16,'align':'center','valign':'vcenter'})
green = wb.add_format({'bg_color':'#DCFCE7','font_color':'#166534','bold':True,'border':1})
red = wb.add_format({'bg_color':'#FEE2E2','font_color':'#991B1B','border':1})

# Priority Leads
ws = wb.add_worksheet('Priority Leads')
headers = ['Rank','Business','Category','City','Tier','Verified Opportunity','Phone','Email','Reachability','Angle','Subject','Individualized Initial Pitch','Source URL','Verified','Status']
for c,h in enumerate(headers): ws.write(0,c,h,hdr)
for r,l in enumerate(leads,1):
    vals=[l.get('rank'),l.get('business'),l.get('category'),l.get('city'),l.get('tier'),l.get('opportunity'),l.get('phone'),l.get('email'),l.get('reachability'),l.get('angle'),l.get('subject'),l.get('initial'),l.get('source'),l.get('verified'),history.get(l.get('business'),{}).get('stage',l.get('status','Contact Ready'))]
    for c,v in enumerate(vals): ws.write(r,c,v,cell)
ws.freeze_panes(1,0); ws.autofilter(0,0,len(leads),len(headers)-1)
widths=[7,30,26,20,8,48,18,30,26,44,36,68,46,14,18]
for i,w in enumerate(widths): ws.set_column(i,i,w)
ws.conditional_format(1,4,max(len(leads),1),4,{'type':'text','criteria':'containing','value':'A','format':green})

# Scripts
sw = wb.add_worksheet('Scripts')
for c,h in enumerate(['Script ID','Stage','When to Use','Copy']): sw.write(0,c,h,hdr)
for r,s in enumerate(script_data.get('scripts',[]),1):
    for c,v in enumerate([s.get('id'),s.get('stage'),s.get('when'),s.get('copy')]): sw.write(r,c,v,cell)
sw.freeze_panes(1,0); sw.set_column(0,0,12); sw.set_column(1,1,24); sw.set_column(2,2,32); sw.set_column(3,3,92)

# Pipeline
pw = wb.add_worksheet('Pipeline')
pheaders=['Lead','Priority','Channel','First Touch','FU1 Due','FU1 Sent','FU2 Due','FU2 Sent','Reply','Stage','Quoted $','Paid $','Fulfilled','Next Action','Opt Out','Last Verified','Source']
for c,h in enumerate(pheaders): pw.write(0,c,h,hdr)
stages=['Contact Ready','Contacted','Replied','Negotiating','Won/Paid','Fulfilled','Follow-up','Lost/Not a Fit','Do Not Contact','Reverify']
for r,l in enumerate(leads,1):
    rec=history.get(l.get('business'),{})
    channel=l.get('email') or l.get('phone') or ''
    vals=[l.get('business'),l.get('rank'),channel,rec.get('firstTouch',''),rec.get('fu1Due',''),rec.get('fu1Sent',''),rec.get('fu2Due',''),rec.get('fu2Sent',''),rec.get('reply',''),rec.get('stage',l.get('status','Contact Ready')),rec.get('quoted',150),rec.get('paid',0),rec.get('fulfilled',''),rec.get('nextAction',''),rec.get('optOut',''),l.get('verified'),l.get('source')]
    for c,v in enumerate(vals): pw.write(r,c,v,money if c in (10,11) else cell)
pw.data_validation(1,9,500,9,{'validate':'list','source':stages})
pw.freeze_panes(1,0); pw.autofilter(0,0,len(leads),len(pheaders)-1)
for i,w in enumerate([30,9,30,18,14,14,14,14,42,18,12,12,14,38,10,14,48]): pw.set_column(i,i,w)
pw.conditional_format(1,9,500,9,{'type':'text','criteria':'containing','value':'Won/Paid','format':green})
pw.conditional_format(1,9,500,9,{'type':'text','criteria':'containing','value':'Do Not Contact','format':red})

# Archived Leads
aw = wb.add_worksheet('Archived Leads')
aheaders=['Business','Stage','First Touch','Reply','Quoted $','Paid $','Archived','Opt Out']
for c,h in enumerate(aheaders): aw.write(0,c,h,subhdr)
row=1
for name,rec in history.items():
    if rec.get('archived'):
        vals=[name,rec.get('stage',''),rec.get('firstTouch',''),rec.get('reply',''),rec.get('quoted',0),rec.get('paid',0),rec.get('archived',''),rec.get('optOut','')]
        for c,v in enumerate(vals): aw.write(row,c,v,money if c in (4,5) else cell)
        row+=1
aw.freeze_panes(1,0); aw.set_column(0,0,32); aw.set_column(1,7,22)

# Sources
ss = wb.add_worksheet('Sources')
for c,h in enumerate(['Business','Verified Opportunity','Source URL','Verified Date','Reverify Rule']): ss.write(0,c,h,hdr)
for r,l in enumerate(leads,1):
    vals=[l.get('business'),l.get('opportunity'),l.get('source'),l.get('verified'),'Reverify time-sensitive offers, hours, financing, ETA, and contact details before outreach.']
    for c,v in enumerate(vals): ss.write(r,c,v,cell)
ss.freeze_panes(1,0); ss.set_column(0,0,32); ss.set_column(1,1,58); ss.set_column(2,2,50); ss.set_column(3,3,14); ss.set_column(4,4,54)

# Dashboard
D=wb.add_worksheet('Dashboard'); D.merge_range('A1:E1','SAME-DAY CUSTOMER GROWTH PACK — LIVE DASHBOARD',title); D.set_row(0,28)
for c,h in enumerate(['Metric','Value','','Revenue Metric','Value']): D.write(2,c,h,hdr if c!=2 else cell)
metrics=[('Contact Ready','Contact Ready'),('Contacted','Contacted'),('Replied','Replied'),('Negotiating','Negotiating'),('Won/Paid','Won/Paid'),('Fulfilled','Fulfilled')]
for i,(label,stage) in enumerate(metrics,3):
    D.write(i,0,label,cell); D.write_formula(i,1,f'=COUNTIF(Pipeline!J:J,"{stage}")',cell)
D.write(3,3,'Quoted Pipeline',cell); D.write_formula(3,4,'=SUM(Pipeline!K:K)',money)
D.write(4,3,'Paid Revenue',cell); D.write_formula(4,4,'=SUM(Pipeline!L:L)',money)
D.write(5,3,'Response Rate',cell); D.write_formula(5,4,'=IFERROR(COUNTIF(Pipeline!J:J,"Replied")/COUNTIF(Pipeline!D:D,"<>"),0)',pct)
D.write(6,3,'Close Rate',cell); D.write_formula(6,4,'=IFERROR(COUNTIF(Pipeline!J:J,"Won/Paid")/COUNTIF(Pipeline!D:D,"<>"),0)',pct)
D.set_column('A:A',20); D.set_column('B:B',14); D.set_column('C:C',4); D.set_column('D:D',22); D.set_column('E:E',16)

# Update Rules
uw=wb.add_worksheet('Update Rules')
rules=[
('Canonical lead feed','sales-engine-app/data/leads.json'),('Canonical pipeline history','sales-engine/pipeline-history.json'),('Canonical workbook','sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx'),('Evidence','Every active lead requires a current source URL and dated evidence-based opportunity.'),('Contacts','Never invent email, phone, person, role, offer, or contact detail.'),('Pipeline truth','Never mark contact, reply, payment, customer, revenue, or fulfillment unless it actually occurred.'),('Follow-up','Initial cold contact + max two cold follow-ups, then stop unless they reply.'),('Opt-out','Immediately stop and mark Do Not Contact.'),('Claims','No guaranteed leads, ROI, rankings, bookings, response rates, or revenue.'),('Workbook generation','GitHub Actions regenerates this XLSX from the live feed + pipeline history.')]
uw.write(0,0,'Rule',hdr); uw.write(0,1,'Requirement',hdr)
for r,(a,b) in enumerate(rules,1): uw.write(r,0,a,cell); uw.write(r,1,b,cell)
uw.set_column(0,0,28); uw.set_column(1,1,92)

# Refresh Log
rw=wb.add_worksheet('Refresh Log'); rw.write_row(0,0,['Refresh Date','Lead Feed Date','Active Leads','Archived Records','Notes'],hdr)
rw.write_row(1,0,[lead_data.get('meta',{}).get('lastUpdated',''),lead_data.get('meta',{}).get('lastUpdated',''),len(leads),sum(1 for x in history.values() if x.get('archived')),'Generated automatically from verified GitHub sources; pipeline history preserved separately.'],cell)
rw.set_column(0,3,18); rw.set_column(4,4,78)

wb.close()
print(f'Generated {OUT}')
