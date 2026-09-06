<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Experiments {
    const STATUSES=['draft','running','completed','cancelled'];

    public static function create(WP_REST_Request $req){
        $p=(array)$req->get_json_params();
        if(empty($p['name'])||empty($p['primary_kpi'])) return new WP_Error('fdos_experiment_required','name and primary_kpi are required.',['status'=>400]);
        $id=FDOS_VLS_DB::insert_experiment([
            'name'=>sanitize_text_field($p['name']),
            'hypothesis'=>sanitize_textarea_field($p['hypothesis']??''),
            'primary_kpi'=>sanitize_key($p['primary_kpi']),
            'guardrails'=>array_values(array_filter((array)($p['guardrails']??[]),'is_scalar')),
            'baseline_start'=>self::date($p['baseline_start']??''),'baseline_end'=>self::date($p['baseline_end']??''),
            'observation_start'=>self::date($p['observation_start']??''),'observation_end'=>self::date($p['observation_end']??''),
            'status'=>'draft','decision'=>'pending'
        ]);
        return $id?new WP_REST_Response(['experiment_id'=>$id],201):new WP_Error('fdos_experiment_store','Unable to create experiment.',['status'=>500]);
    }
    public static function listing(WP_REST_Request $req){return new WP_REST_Response(FDOS_VLS_DB::list_experiments((int)($req['limit']?:50),sanitize_key($req['status']??'')),200);}
    public static function get(WP_REST_Request $req){$e=FDOS_VLS_DB::get_experiment($req['id']);return $e?new WP_REST_Response($e,200):new WP_Error('fdos_experiment_missing','Experiment not found.',['status'=>404]);}
    public static function update(WP_REST_Request $req){
        $id=$req['id']; if(!FDOS_VLS_DB::get_experiment($id)) return new WP_Error('fdos_experiment_missing','Experiment not found.',['status'=>404]);
        $p=(array)$req->get_json_params(); $u=[];
        foreach(['name','primary_kpi'] as $k) if(array_key_exists($k,$p)) $u[$k]=sanitize_text_field($p[$k]);
        if(array_key_exists('hypothesis',$p))$u['hypothesis']=sanitize_textarea_field($p['hypothesis']);
        foreach(['baseline_start','baseline_end','observation_start','observation_end'] as $k) if(array_key_exists($k,$p)) $u[$k]=self::date($p[$k]);
        if(array_key_exists('guardrails',$p))$u['guardrails']=array_values(array_filter((array)$p['guardrails'],'is_scalar'));
        if(array_key_exists('status',$p)){ $s=sanitize_key($p['status']); if(!in_array($s,self::STATUSES,true)) return new WP_Error('fdos_status','Invalid status.',['status'=>400]); $u['status']=$s; }
        FDOS_VLS_DB::update_experiment($id,$u); return new WP_REST_Response(FDOS_VLS_DB::get_experiment($id),200);
    }
    public static function start(WP_REST_Request $req){
        $e=FDOS_VLS_DB::get_experiment($req['id']); if(!$e) return new WP_Error('fdos_experiment_missing','Experiment not found.',['status'=>404]);
        foreach(['baseline_start','baseline_end','observation_start','observation_end'] as $k) if(empty($e[$k])) return new WP_Error('fdos_window','All baseline and observation dates are required before start.',['status'=>400]);
        FDOS_VLS_DB::update_experiment($req['id'],['status'=>'running']); return new WP_REST_Response(FDOS_VLS_DB::get_experiment($req['id']),200);
    }
    public static function report(WP_REST_Request $req){ return new WP_REST_Response(self::build_report($req['id']),200); }
    public static function build_report($id){
        $e=FDOS_VLS_DB::get_experiment($id); if(!$e) return ['error'=>'Experiment not found'];
        $correlated=FDOS_VLS_DB::experiment_event_count($id)>0;
        $scope=$correlated?$id:null;
        $b=FDOS_VLS_DB::metric_window($e['primary_kpi'],$e['baseline_start'],$e['baseline_end'],$scope);
        $o=FDOS_VLS_DB::metric_window($e['primary_kpi'],$e['observation_start'],$e['observation_end'],$scope);
        $bv=(float)$b['value']; $ov=(float)$o['value']; $delta=$ov-$bv; $pct=$bv!=0?round(($delta/$bv)*100,2):null;
        $complete=!empty($e['observation_end']) && gmdate('Y-m-d')>$e['observation_end']; $decision='insufficient_evidence';
        if($complete && $b['count']>0 && $o['count']>0) $decision=$delta>0?'keep':($delta<0?'revert':'revise');
        $report=['experiment_id'=>$id,'primary_kpi'=>$e['primary_kpi'],'event_scope'=>$correlated?'experiment_correlated':'legacy_event_type_scope','baseline'=>$b,'observation'=>$o,'absolute_delta'=>$delta,'percent_change'=>$pct,'complete'=>$complete,'decision'=>$decision,'evidence_class'=>'E4','limitation'=>'Directional before/after comparison only. Confounding may exist; this does not prove causation.'];
        if($complete) FDOS_VLS_DB::update_experiment($id,['status'=>'completed','decision'=>$decision,'result_json'=>$report]);
        return $report;
    }
    private static function date($v){$v=sanitize_text_field((string)$v);return preg_match('/^\d{4}-\d{2}-\d{2}$/',$v)?$v:null;}
}
