#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/'reports'/'stegmusic-browser-execution.json'
BASE_URL=os.environ.get('STEGMUSIC_TEST_BASE_URL','http://127.0.0.1:8000')
EXPECTED=['Night Drive Boundary','Low Orbit Relay','Signal Rise','Black Glass Highway','Slow Telemetry','Redline Signal']
def event_types(page):
    raw=page.locator('#rawEvents').text_content() or ''
    out=[]
    for line in raw.splitlines():
        try: payload=json.loads(line)
        except json.JSONDecodeError: continue
        if isinstance(payload.get('event_type'),str): out.append(payload['event_type'])
    return out
def main():
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    result={'schema_version':'1.4.0','status_type':'stegmusic_browser_execution','page':f'{BASE_URL}/ecosystem-music.html','passed':False,'browser_audio_execution_verified':False,'audible_output_confirmed':False,'catalog_license_verified':False,'custody_verified_by_this_check':False,'activation_authority_granted':False,'checks':{},'selected_titles':[],'console':[],'page_errors':[]}
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream'])
            page=browser.new_page(); page.on('console',lambda m:result['console'].append({'type':m.type,'text':m.text})); page.on('pageerror',lambda e:result['page_errors'].append(str(e)))
            page.goto(result['page'],wait_until='networkidle'); page.wait_for_timeout(1200)
            registry=page.evaluate("typeof window.StegMusicSixTrackRegistry==='object'")
            count=page.evaluate("window.StegMusicRuntime?.getTrackCount?.() || 0")
            buttons=page.locator('[data-six-track]')
            for i in range(buttons.count()):
                buttons.nth(i).click(); page.wait_for_timeout(120)
                result['selected_titles'].append((page.locator('#trackTitle').text_content() or '').strip())
            page.locator('[data-six-track="3"]').click(); page.wait_for_timeout(100)
            before_adaptive=(page.locator('#trackTitle').text_content() or '').strip()
            page.locator('#adaptiveNext').click(); page.wait_for_timeout(500)
            after_adaptive=(page.locator('#trackTitle').text_content() or '').strip()
            adaptive_state=json.loads(page.locator('#adaptiveModel').text_content() or '{}')
            page.locator('[data-six-track="3"]').click(); page.locator('#playPause').click(); page.wait_for_timeout(4200)
            notice=(page.locator('#audioNotice').text_content() or '').lower(); progress=float(page.locator('#progress').input_value())
            if page.locator('#playPause').text_content().strip().lower()=='pause': page.locator('#playPause').click(); page.wait_for_timeout(300)
            observed=set(event_types(page))
            checks={'page_loaded':page.locator('#playPause').count()==1,'six_track_registry_loaded':registry,'runtime_track_count_is_six':count==6,'all_six_titles_selectable':result['selected_titles']==EXPECTED,'adaptive_candidate_count_is_six':adaptive_state.get('candidate_count')==6,'adaptive_registry_backed':adaptive_state.get('registry_backed') is True,'adaptive_selected_different_track':before_adaptive!=after_adaptive,'adaptive_decision_event':'adaptive_selection_decision' in observed,'enhancement_loaded':page.evaluate("typeof window.StegMusicEnhancement==='object'"),'enhanced_audio_active':'normalized harmonic mix playing' in notice,'composition_advanced':progress>0,'registry_ready_event':'stegmusic_six_track_registry_ready' in observed,'enhanced_playback_event':'enhanced_media_playback_started' in observed,'no_page_errors':not result['page_errors']}
            result['adaptive']={'before':before_adaptive,'after':after_adaptive,'state':adaptive_state}
            result['checks']=checks; result['observed_event_types']=sorted(observed); result['passed']=all(checks.values()); result['browser_audio_execution_verified']=result['passed']; browser.close()
    except Exception as error: result['error']=str(error)
    REPORT.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8'); print(json.dumps(result,indent=2)); return 0 if result['passed'] else 1
if __name__=='__main__': raise SystemExit(main())
