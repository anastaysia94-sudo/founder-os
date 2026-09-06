<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Engine {
    const EVIDENCE_CLASSES = [
        'E1'=>'Verified Fact','E2'=>'Current External Evidence','E3'=>'Customer-Derived Evidence','E4'=>'Internal Observation','E5'=>'Strategic Hypothesis','E6'=>'Financial Model Assumption','E7'=>'Forecast','E8'=>'Illustrative Example'
    ];

    public static function opportunity_score(array $i) {
        $impact=max(1,min(10,(float)($i['impact']??5)));
        $evidence=max(1,min(10,(float)($i['evidence_strength']??5)));
        $speed=max(1,min(10,(float)($i['speed']??5)));
        $reversibility=max(1,min(10,(float)($i['reversibility']??5)));
        $cost=max(1,min(10,(float)($i['cost']??5)));
        $complexity=max(1,min(10,(float)($i['complexity']??5)));
        $risk=max(1,min(10,(float)($i['risk']??5)));
        $score=($impact*$evidence*$speed*$reversibility)/(($cost+$complexity+$risk)*10);
        return round(min(100,$score),1);
    }

    public static function analyze(array $input) {
        $findings=[];
        $website=trim((string)($input['website_url']??''));
        $facebook=trim((string)($input['facebook_url']??''));
        $idea=trim((string)($input['business_idea']??''));
        if($website){
            $live=FDOS_VLS_Live_Evidence::audit($website);
            if(!empty($live['findings'])) $findings=array_merge($findings,$live['findings']);
        }
        if($facebook && !$website){
            $findings[]=[
                'key'=>'facebook_permission_boundary','observation'=>'A Facebook business URL was submitted, but FDOS did not fetch or infer page content without a permissioned adapter.','evidence'=>'E4','confidence'=>100,
                'priority_score'=>self::opportunity_score(['impact'=>5,'evidence_strength'=>10,'speed'=>8,'reversibility'=>10,'cost'=>2,'complexity'=>3,'risk'=>2]),
                'action'=>'Connect a permissioned Facebook/Meta evidence adapter before making page-specific claims.'
            ];
        }
        if($idea){
            $findings[]=[
                'key'=>'idea_validation','observation'=>'A business idea was provided without verified customer or market evidence in this intake.','evidence'=>'E4','confidence'=>100,
                'priority_score'=>self::opportunity_score(['impact'=>8,'evidence_strength'=>9,'speed'=>8,'reversibility'=>9,'cost'=>2,'complexity'=>3,'risk'=>2]),
                'action'=>'Run a narrow customer-evidence experiment before treating demand, pricing, or market size as fact.'
            ];
        }
        if(!$findings){
            $findings[]=[
                'key'=>'missing_input','observation'=>'No analyzable website, Facebook business URL, or business idea was supplied.','evidence'=>'E1','confidence'=>100,'priority_score'=>0,
                'action'=>'Submit at least one business input.'
            ];
        }
        usort($findings,function($a,$b){return ($b['priority_score']??0)<=>($a['priority_score']??0);});
        foreach($findings as &$f){$f['value_sprint']=self::value_sprint($f);} unset($f);
        return $findings;
    }

    public static function value_sprint(array $finding) {
        return [
            'problem'=>$finding['observation']??'',
            'evidence_class'=>$finding['evidence']??'E4',
            'hypothesis'=>'E5: Addressing this finding may improve the selected business outcome; this must be tested rather than assumed.',
            'recommended_action'=>$finding['action']??'',
            'baseline_required'=>true,
            'primary_kpi'=>'Choose one measurable KPI before intervention',
            'guardrails'=>['Do not call correlation causation','Do not call revenue profit','Record uncertainty and limitations'],
            'decision_rule'=>'After the observation window, compare the selected KPI with baseline and choose KEEP, REVISE, or REVERT.'
        ];
    }
}
