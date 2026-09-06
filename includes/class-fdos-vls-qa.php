<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_QA {
    public static function run(){
        $run=FDOS_VLS_DB::uuid();$checks=[];$check=function($id,$ok,$detail='')use(&$checks){$checks[]=['id'=>$id,'status'=>$ok?'PASS':'FAIL','detail'=>$detail];};
        foreach(['fdos_intakes','fdos_evidence_events','fdos_experiments','fdos_qa_runs'] as $t)$check('table_'.$t,FDOS_VLS_DB::table_exists($t));
        $expected=['E1','E2','E3','E4','E5','E6','E7','E8'];$check('evidence_taxonomy',array_keys(FDOS_VLS_Engine::EVIDENCE_CLASSES)===$expected);
        $find=FDOS_VLS_Engine::analyze(['business_idea'=>'Synthetic QA business idea']);$check('scanner_ranked_finding',!empty($find)&&isset($find[0]['priority_score'],$find[0]['value_sprint']));
        $intake=FDOS_VLS_DB::insert_intake(['business_idea'=>'Synthetic QA','findings'=>$find]);$check('intake_persistence',(bool)$intake);
        $dedupe='fdos-qa:'.$run; $event=FDOS_VLS_DB::insert_event(['dedupe_key'=>$dedupe,'intake_public_id'=>$intake,'event_type'=>'qa_metric','project'=>'FDOS QA','channel'=>'qa','numeric_value'=>1,'evidence_class'=>'E4','confidence'=>100,'source_type'=>'fdos_qa','occurred_at'=>current_time('mysql',true)]);$check('event_persistence',(bool)$event);
        $dup=FDOS_VLS_DB::insert_event(['dedupe_key'=>$dedupe,'event_type'=>'qa_metric','evidence_class'=>'E4','source_type'=>'fdos_qa']);$check('dedupe_idempotency',$dup===$event);
        $today=gmdate('Y-m-d');$metric=FDOS_VLS_DB::metric_window('qa_metric',$today,$today);$check('metric_window',$metric['count']>=1);
        $exp=FDOS_VLS_DB::insert_experiment(['name'=>'QA Experiment','hypothesis'=>'Synthetic','primary_kpi'=>'qa_metric','guardrails'=>[],'baseline_start'=>$today,'baseline_end'=>$today,'observation_start'=>$today,'observation_end'=>$today,'status'=>'running','decision'=>'pending']);$check('experiment_persistence',(bool)$exp);
        $check('shopify_hmac_valid',FDOS_VLS_Shopify::verify_hmac('{"a":1}',base64_encode(hash_hmac('sha256','{"a":1}','secret',true)),'secret'));
        $check('shopify_hmac_invalid',!FDOS_VLS_Shopify::verify_hmac('{"a":1}','bad','secret'));
        FDOS_VLS_DB::delete_qa_records();$check('qa_cleanup',FDOS_VLS_DB::qa_records_remaining()===0);
        $fail=count(array_filter($checks,fn($c)=>$c['status']==='FAIL'));$pass=count($checks)-$fail;$report=['run_id'=>$run,'internal_status'=>$fail?'FAIL':'PASS','pass_count'=>$pass,'fail_count'=>$fail,'pending_count'=>0,'checks'=>$checks,'external_gates'=>['live_shopify_secret'=>(bool)FDOS_VLS_Shopify::secret()?'READY':'PENDING','https_runtime'=>is_ssl()?'READY':'PENDING','external_value_sprint'=>'PENDING until genuine external usage'],'truth_boundary'=>'Internal QA does not prove public deployment, live Shopify delivery, customer adoption, or financial results.'];FDOS_VLS_DB::insert_qa_run($report);return new WP_REST_Response($report,$fail?500:200);
    }
}
