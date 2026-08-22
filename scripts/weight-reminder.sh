#!/bin/zsh
# 14일 경과 시 텔레그램 알림. 매일 실행되고 스스로 주기 판단 (맥 꺼져있던 날 보정)
STAMP="$HOME/.fitlog-weight-reminder"
if [[ ! -f $STAMP ]] || (( $(date +%s) - $(stat -f %m "$STAMP") >= 14*86400 )); then
  tg-alarm "🐰 몸무게 재셔야 하는 날이에요! ⚖️" && touch "$STAMP"
fi
