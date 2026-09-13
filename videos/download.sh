#!/bin/sh
# SPOTLITE (UID 192062329) AI 相关视频下载：22 个，1080p + ai-zh 字幕
cd "$(dirname "$0")"
YT="yt-dlp --cookies cookie.txt --download-archive archive.txt \
  -f 'bv*[height<=1920]+ba/b' --merge-output-format mp4 \
  --write-subs --sub-langs ai-zh --convert-subs srt \
  --retries 5 --fragment-retries 5 \
  -o '%(upload_date)s-%(id)s-%(title).50s.%(ext)s'"

for bv in \
  BV1otY26LE8w BV1i6Y86AEv3 BV1GtbL63Ekt BV1xQtf6SEHR BV1hLtG6ZE5M \
  BV1E5426eE5X BV1qGh56JEj2 BV1qU846JEpW BV1dx3Q6iEbZ BV1dtgf6pEbW \
  BV17QN66tEKX BV1kgN26SECZ BV14yT46kE5T BV1YxjU6qEuw BV1Y2LX61EjQ \
  BV1UMEv68E3C BV1KKE96CELt BV1XrE26iEMG BV12ZEN6CEho BV1QC7Q61E3T \
  BV1nVVr6QEFq; do
  echo "=== $bv ==="
  eval $YT "https://www.bilibili.com/video/$bv/" || echo "FAILED: $bv" >> failed.txt
done
echo "DONE. mp4 count: $(ls *.mp4 2>/dev/null | wc -l), srt count: $(ls *.srt 2>/dev/null | wc -l)"
