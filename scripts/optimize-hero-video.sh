#!/usr/bin/env bash
set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffmpeg and ffprobe are required. Install with: brew install ffmpeg" >&2
  exit 1
fi

INPUT_FILE="${1:-loopingVideo720.mov}"
OUTPUT_DIR="${2:-public/media/hero}"
SELECTED_PROFILE="${3:-small}"
VARIANTS_DIR="${OUTPUT_DIR}/variants"

if [[ ! -f "${INPUT_FILE}" ]]; then
  echo "Input file not found: ${INPUT_FILE}" >&2
  exit 1
fi

if [[ "${SELECTED_PROFILE}" != "balanced" && "${SELECTED_PROFILE}" != "small" && "${SELECTED_PROFILE}" != "tiny" ]]; then
  echo "Invalid profile '${SELECTED_PROFILE}'. Use one of: balanced, small, tiny" >&2
  exit 1
fi

mkdir -p "${VARIANTS_DIR}"

echo "Input video:"
ffprobe -v error \
  -show_entries format=filename,duration,size,bit_rate \
  -show_entries stream=codec_name,codec_type,width,height,avg_frame_rate \
  -of compact=p=0:nk=1 "${INPUT_FILE}"

echo
echo "Encoding MP4 variants..."
ffmpeg -y -i "${INPUT_FILE}" -an -vf "fps=24,scale=640:-2:flags=lanczos" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart \
  "${VARIANTS_DIR}/hero-mobile-balanced.mp4"
ffmpeg -y -i "${INPUT_FILE}" -an -vf "fps=20,scale=576:-2:flags=lanczos" \
  -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart \
  "${VARIANTS_DIR}/hero-mobile-small.mp4"
ffmpeg -y -i "${INPUT_FILE}" -an -vf "fps=18,scale=480:-2:flags=lanczos" \
  -c:v libx264 -crf 34 -preset slow -pix_fmt yuv420p -movflags +faststart \
  "${VARIANTS_DIR}/hero-mobile-tiny.mp4"

echo
echo "Encoding WebM variants..."
ffmpeg -y -i "${INPUT_FILE}" -an -vf "fps=24,scale=640:-2:flags=lanczos" \
  -c:v libvpx-vp9 -b:v 0 -crf 35 -deadline good -cpu-used 1 -row-mt 1 \
  "${VARIANTS_DIR}/hero-mobile-balanced.webm"
ffmpeg -y -i "${INPUT_FILE}" -an -vf "fps=20,scale=576:-2:flags=lanczos" \
  -c:v libvpx-vp9 -b:v 0 -crf 40 -deadline good -cpu-used 2 -row-mt 1 \
  "${VARIANTS_DIR}/hero-mobile-small.webm"
ffmpeg -y -i "${INPUT_FILE}" -an -vf "fps=18,scale=480:-2:flags=lanczos" \
  -c:v libvpx-vp9 -b:v 0 -crf 43 -deadline good -cpu-used 3 -row-mt 1 \
  "${VARIANTS_DIR}/hero-mobile-tiny.webm"

cp "${VARIANTS_DIR}/hero-mobile-${SELECTED_PROFILE}.mp4" "${OUTPUT_DIR}/hero-mobile.mp4"
cp "${VARIANTS_DIR}/hero-mobile-${SELECTED_PROFILE}.webm" "${OUTPUT_DIR}/hero-mobile.webm"

POSTER_JPG="${OUTPUT_DIR}/hero-mobile-poster.jpg"
ffmpeg -y -ss 00:00:02.4 -i "${INPUT_FILE}" -frames:v 1 \
  -vf "scale=576:-2" -q:v 6 -update 1 "${POSTER_JPG}"

POSTER_FINAL="${POSTER_JPG}"
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q 'libwebp'; then
  POSTER_WEBP="${OUTPUT_DIR}/hero-mobile-poster.webp"
  ffmpeg -y -i "${POSTER_JPG}" -c:v libwebp -quality 78 "${POSTER_WEBP}"
  POSTER_FINAL="${POSTER_WEBP}"
fi

hash8() {
  shasum -a 256 "$1" | awk '{print substr($1,1,8)}'
}

MP4_HASH=$(hash8 "${OUTPUT_DIR}/hero-mobile.mp4")
WEBM_HASH=$(hash8 "${OUTPUT_DIR}/hero-mobile.webm")
POSTER_HASH=$(hash8 "${POSTER_JPG}")

cp "${OUTPUT_DIR}/hero-mobile.mp4" "${OUTPUT_DIR}/hero-mobile.${MP4_HASH}.mp4"
cp "${OUTPUT_DIR}/hero-mobile.webm" "${OUTPUT_DIR}/hero-mobile.${WEBM_HASH}.webm"
cp "${POSTER_JPG}" "${OUTPUT_DIR}/hero-mobile-poster.${POSTER_HASH}.jpg"

echo
echo "Variant sizes:"
ls -lh "${VARIANTS_DIR}" | awk 'NR==1 || /hero-mobile-/'

echo
echo "Selected profile: ${SELECTED_PROFILE}"
echo "Final output sizes:"
ls -lh "${OUTPUT_DIR}/hero-mobile.mp4" "${OUTPUT_DIR}/hero-mobile.webm" "${POSTER_FINAL}"
echo "Versioned hero files:"
ls -lh "${OUTPUT_DIR}/hero-mobile.${MP4_HASH}.mp4" "${OUTPUT_DIR}/hero-mobile.${WEBM_HASH}.webm" "${OUTPUT_DIR}/hero-mobile-poster.${POSTER_HASH}.jpg"
echo "Reminder: update Hero.tsx and index.html if you want to switch to the newly versioned filenames."

echo
echo "Final output metadata:"
for file in "${OUTPUT_DIR}/hero-mobile.mp4" "${OUTPUT_DIR}/hero-mobile.webm"; do
  echo "=== ${file} ==="
  ffprobe -v error \
    -show_entries stream=codec_name,codec_type,width,height,avg_frame_rate \
    -show_entries format=duration,size,bit_rate \
    -of compact=p=0:nk=1 "${file}"
done
