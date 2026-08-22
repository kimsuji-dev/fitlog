#!/bin/zsh
# 14일 경과 시 운동봇으로 측정 알림 (버튼 누르면 미니앱 측정 탭이 바로 열림). 매일 실행, 스스로 주기 판단.
STAMP="$HOME/.fitlog-weight-reminder"
if [[ ! -f $STAMP ]] || (( $(date +%s) - $(stat -f %m "$STAMP") >= 14*86400 )); then
  /usr/bin/python3 - <<'PY' && touch "$STAMP"
import json, os, urllib.parse, urllib.request
cfg = {}
for line in open(os.path.expanduser("~/.config/aegis/telegram.env")):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1); cfg[k.strip()] = v.strip()
token, chat = cfg.get("TG_FIT_TOKEN", ""), cfg.get("TG_FIT_CHAT_ID", "")
if not token or not chat:
    raise SystemExit(1)
text = ("📏 MEASUREMENT DAY girl!! Chloe here 💅 🗓️✨ 2주 지났어~ 체중 + 허리/엉덩이/허벅지/팔뚝 재고 기록하자 📐🍑 재는 법은 앱에 있어 👀\n"
        "Progress is progress 📈 numbers don't lie honey 💅 Tap below 👇")
markup = json.dumps({"inline_keyboard": [[{"text": "📏 측정 기록하기", "web_app": {"url": "https://kimsuji-dev.github.io/fitlog/?tab=measure"}}]]})
urllib.request.urlopen(f"https://api.telegram.org/bot{token}/sendMessage",
    urllib.parse.urlencode({"chat_id": chat, "text": text, "reply_markup": markup}).encode(), timeout=20)
PY
fi
